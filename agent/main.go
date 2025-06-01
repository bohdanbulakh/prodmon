package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	fmt.Println("Агент запущено.")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)
		<-c
		fmt.Println("Отримано сигнал завершення. Вихід...")
		cancel()
	}()

	err := StartWebSocketClient(ctx)
	if err != nil {
		fmt.Println("WebSocket клієнт завершився з помилкою:", err)
	}
}
