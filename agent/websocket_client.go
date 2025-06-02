package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"sync/atomic"
	"syscall"
	"time"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type ControlMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type TimeDTO struct {
	Time int `json:"update_time"`
}

type SignalDTO struct {
	PID    int    `json:"pid"`
	Signal string `json:"signal"`
}

var (
	wsURLGlobal     = getWebSocketURL()
	updateInterval  atomic.Int64
	defaultInterval = int64(5)
)

func getWebSocketURL() string {
	if url := os.Getenv("API_URL"); url != "" {
		return url
	}
	return "ws://localhost:8000/metrics"
}

func StartWebSocketClient(ctx context.Context) error {
	fmt.Println("Підключення до WebSocket:", wsURLGlobal)

	conn, _, err := websocket.Dial(ctx, wsURLGlobal, nil)
	if err != nil {
		return fmt.Errorf("не вдалося підключитися до WebSocket: %w", err)
	}
	defer conn.Close(websocket.StatusNormalClosure, "закрито клієнтом")

	updateInterval.Store(defaultInterval)

	go handleIncomingMessages(ctx, conn)

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-time.After(time.Duration(updateInterval.Load()) * time.Second):
			metrics, err := CollectMetrics()
			if err != nil {
				fmt.Println("Помилка збору метрик:", err)
				continue
			}
			if err := wsjson.Write(ctx, conn, metrics); err != nil {
				fmt.Println("Помилка надсилання метрик через WebSocket:", err)
			} else {
				fmt.Println("Метрики надіслано через WebSocket.")
			}
		}
	}
}

func handleIncomingMessages(ctx context.Context, conn *websocket.Conn) {
	for {
		var ctrlMsg ControlMessage
		err := wsjson.Read(ctx, conn, &ctrlMsg)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				fmt.Println("З'єднання завершено: контекст скасовано.")
			} else {
				fmt.Println("Помилка читання з WebSocket:", err)
			}
			return
		}

		switch ctrlMsg.Type {
		case "setTime":
			handleSetTime(ctrlMsg.Data)
		case "sendSignal":
			handleSendSignal(ctrlMsg.Data)
		default:
			fmt.Println("Невідомий тип повідомлення:", ctrlMsg.Type)
		}
	}
}

func handleSetTime(data json.RawMessage) {
	var dto TimeDTO
	if err := json.Unmarshal(data, &dto); err == nil && dto.Time > 0 {
		updateInterval.Store(int64(dto.Time))
		fmt.Println("Частоту оновлення змінено на", dto.Time, "сек.")
	}
}

func handleSendSignal(data json.RawMessage) {
	var dto SignalDTO
	if err := json.Unmarshal(data, &dto); err != nil {
		fmt.Println("Невірний формат сигналу:", err)
		return
	}

	var sigErr error
	switch runtime.GOOS {
	case "windows":
		cmd := parseSignalWindows(dto.PID, dto.Signal)
		if cmd == nil {
			fmt.Println("Невідомий сигнал для Windows:", dto.Signal)
			return
		}
		sigErr = cmd.Run()

	default:
		sig := parseSignalLinux(dto.Signal)
		if sig == -1 {
			fmt.Println("Невідомий сигнал для Linux:", dto.Signal)
			return
		}
		proc, err := os.FindProcess(dto.PID)
		if err != nil {
			sigErr = err
		} else {
			sigErr = proc.Signal(sig)
		}
	}

	if sigErr != nil {
		fmt.Println("Не вдалося надіслати сигнал:", sigErr)
	} else {
		fmt.Printf("Сигнал '%s' надіслано процесу PID %d\n", dto.Signal, dto.PID)
	}
}

func parseSignalLinux(sigStr string) syscall.Signal {
	switch sigStr {
	case "KILL", "kill", "SIGKILL":
		return syscall.SIGKILL
	case "TERM", "term", "SIGTERM":
		return syscall.SIGTERM
	default:
		return -1
	}
}

func parseSignalWindows(pid int, sigStr string) *exec.Cmd {
	switch sigStr {
	case "KILL", "kill", "SIGKILL":
		return exec.Command("taskkill", "/PID", fmt.Sprintf("%d", pid), "/F")
	case "TERM", "term", "SIGTERM":
		return exec.Command("taskkill", "/PID", fmt.Sprintf("%d", pid))
	default:
		return nil
	}
}
