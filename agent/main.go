package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("Агент запущено.")

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			metrics, err := CollectMetrics()
			if err != nil {
				fmt.Println("Помилка збору метрик:", err)
				continue
			}

			err = SendMetrics(metrics)
			if err != nil {
				fmt.Println("Помилка відправки метрик:", err)
			} else {
				fmt.Println("Метрики успішно надіслано.")
			}
		}
	}
}
