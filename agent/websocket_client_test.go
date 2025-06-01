package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
)

var upgrader = websocket.Upgrader{}

func TestStartWebSocketClient_SendsMetrics(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		assert.NoError(t, err)
		defer conn.Close()

		_, msg, err := conn.ReadMessage()
		assert.NoError(t, err)
		assert.Contains(t, string(msg), `"hostname"`)
		assert.Contains(t, string(msg), `"cpu_usage_percent"`)

		conn.Close()
	}))
	defer server.Close()

	wsURL := "ws" + server.URL[len("http"):]

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	original := wsURLGlobal
	wsURLGlobal = wsURL
	defer func() { wsURLGlobal = original }()

	go StartWebSocketClient(ctx)

	time.Sleep(3 * time.Second)
}
