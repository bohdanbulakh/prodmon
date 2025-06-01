package main

import (
	"context"
	_ "encoding/json"
	"fmt"
	"os"
	"time"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

var wsURLGlobal = func() string {
	if url := os.Getenv("API_URL"); url != "" {
		return url
	}
	return "ws://localhost:8000/ws"
}()

func StartWebSocketClient(ctx context.Context) error {
	fmt.Println("Підключення до WebSocket:", wsURLGlobal)
	conn, _, err := websocket.Dial(ctx, wsURLGlobal, nil)
	if err != nil {
		return fmt.Errorf("не вдалося підключитися до WebSocket: %w", err)
	}
	defer conn.Close(websocket.StatusNormalClosure, "закрито клієнтом")

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			metrics, err := CollectMetrics()
			if err != nil {
				fmt.Println("Помилка збору метрик:", err)
				continue
			}

			err = wsjson.Write(ctx, conn, metrics)
			if err != nil {
				fmt.Println("Помилка надсилання метрик через WebSocket:", err)
			} else {
				fmt.Println("Метрики надіслано через WebSocket.")
			}
		}
	}
}
