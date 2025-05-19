package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSendMetrics(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("Очікував POST, отримав %s", r.Method)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	mockMetrics := &Metrics{
		HostName:          "test-host",
		CPUUsagePercent:   10.5,
		MemoryUsedMB:      2048,
		MemoryUsedPercent: 32.5,
		Processes:         []string{"bash", "go"},
	}

	original := apiURL
	apiURL = server.URL
	defer func() { apiURL = original }()

	err := SendMetrics(mockMetrics)
	if err != nil {
		t.Errorf("SendMetrics повернув помилку: %v", err)
	}
}
