package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"runtime"
	"sync"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
)

func TestStartWebSocketClient_SendsMetrics(t *testing.T) {
	var upgrader = websocket.Upgrader{}
	received := make(chan string, 1)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		assert.NoError(t, err)
		defer conn.Close()

		_, msg, err := conn.ReadMessage()
		assert.NoError(t, err, "не вдалося прочитати першу метрику")
		received <- string(msg)
	}))
	defer srv.Close()

	wsURL := "ws" + srv.URL[len("http"):]
	ctx, cancel := context.WithTimeout(context.Background(), 6*time.Second) // 6с для безпеки
	defer cancel()

	original := wsURLGlobal
	wsURLGlobal = wsURL
	defer func() { wsURLGlobal = original }()

	go StartWebSocketClient(ctx)

	select {
	case msg := <-received:
		assert.Contains(t, msg, `"cpu_usage_percent"`, "повідомлення не містить метрик CPU")
		assert.Contains(t, msg, `"hostname"`, "повідомлення не містить hostname")
	case <-time.After(6 * time.Second):
		t.Fatal("не отримано метрик протягом 6 секунд")
	}
}

func TestStartWebSocketClient_HandlesSetTime(t *testing.T) {
	var upgrader = websocket.Upgrader{}
	var metricsReceived []string
	var mu sync.Mutex
	var controlSent bool

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		assert.NoError(t, err)
		defer conn.Close()

		start := time.Now()

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				t.Log("З'єднання закрито:", err)
				return
			}

			mu.Lock()
			metricsReceived = append(metricsReceived, string(msg))
			count := len(metricsReceived)
			mu.Unlock()

			if count == 1 && !controlSent {
				controlMsg := map[string]any{
					"type": "setTime",
					"data": map[string]any{
						"update_time": 1,
					},
				}
				b, _ := json.Marshal(controlMsg)
				err = conn.WriteMessage(websocket.TextMessage, b)
				assert.NoError(t, err)
				controlSent = true
				t.Log("setTime надіслано")
			}

			if count >= 3 {
				t.Logf("Отримано 3 метрики за %s", time.Since(start))
				return
			}
		}
	}))
	defer srv.Close()

	wsURL := "ws" + srv.URL[len("http"):]
	ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
	defer cancel()

	original := wsURLGlobal
	wsURLGlobal = wsURL
	defer func() { wsURLGlobal = original }()

	go StartWebSocketClient(ctx)

	time.Sleep(12 * time.Second)

	mu.Lock()
	defer mu.Unlock()

	assert.GreaterOrEqual(t, len(metricsReceived), 3, "Очікується принаймні 3 метрики")
	assert.Contains(t, metricsReceived[0], `"cpu_usage_percent"`, "перша метрика не містить CPU даних")
}

func TestStartWebSocketClient_HandlesSendSignal(t *testing.T) {
	if os.Getenv("CI") == "true" {
		t.Skip("Тест пропускається в CI через sandbox-обмеження")
	}

	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("timeout", "/T", "60")
	default:
		cmd = exec.Command("sleep", "60")
	}

	err := cmd.Start()
	assert.NoError(t, err, "не вдалося запустити тестовий процес")

	pid := cmd.Process.Pid
	t.Logf("Запущено тестовий процес з PID %d", pid)

	defer func() {
		_ = cmd.Process.Kill()
	}()

	var upgrader = websocket.Upgrader{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		assert.NoError(t, err)
		defer conn.Close()

		_, _, err = conn.ReadMessage()
		assert.NoError(t, err)

		ctrl := map[string]any{
			"type": "sendSignal",
			"data": map[string]any{
				"pid":    pid,
				"signal": "KILL",
			},
		}
		b, _ := json.Marshal(ctrl)
		err = conn.WriteMessage(websocket.TextMessage, b)
		assert.NoError(t, err)

		time.Sleep(1 * time.Second)
	}))
	defer srv.Close()

	wsURL := "ws" + srv.URL[len("http"):]

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	original := wsURLGlobal
	wsURLGlobal = wsURL
	defer func() { wsURLGlobal = original }()

	go StartWebSocketClient(ctx)

	done := make(chan error, 1)
	go func() {
		done <- cmd.Wait()
	}()

	select {
	case <-done:
		t.Log("Процес завершився після надсилання сигналу")
	case <-time.After(4 * time.Second):
		t.Fatal("Процес не завершився після надсилання сигналу")
	}
}
