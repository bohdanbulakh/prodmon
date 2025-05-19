package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

var apiURL = func() string {
	if url := os.Getenv("API_URL"); url != "" {
		return url
	}
	return "http://localhost:8000/metrics"
}()

func SendMetrics(metrics *Metrics) error {
	jsonData, err := json.Marshal(metrics)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Відповідь сервера: %s", resp.Status)
	}

	return nil
}
