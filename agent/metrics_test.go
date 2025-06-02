package main

import (
	"testing"
)

func TestCollectMetrics_NoError(t *testing.T) {
	_, err := CollectMetrics()
	if err != nil {
		t.Fatalf("Очікується, що помилки не буде, але отримано: %v", err)
	}
}

func TestCollectMetrics_CPU(t *testing.T) {
	metrics, _ := CollectMetrics()
	if metrics.CPUUsagePercent < 0 {
		t.Errorf("CPUUsagePercent не може бути < 0: %f", metrics.CPUUsagePercent)
	}
}

func TestCollectMetrics_MemoryUsed(t *testing.T) {
	metrics, _ := CollectMetrics()
	if metrics.MemoryUsedMB == 0 {
		t.Errorf("MemoryUsedMB не повинен бути 0")
	}
}

func TestCollectMetrics_MemoryPercent(t *testing.T) {
	metrics, _ := CollectMetrics()
	if metrics.MemoryUsedPercent < 0 || metrics.MemoryUsedPercent > 100 {
		t.Errorf("MemoryUsedPercent має бути в межах 0–100, отримано: %f", metrics.MemoryUsedPercent)
	}
}

func TestCollectMetrics_HostName(t *testing.T) {
	metrics, _ := CollectMetrics()
	if metrics.HostName == "" {
		t.Errorf("HostName не повинен бути порожнім")
	}
}

func TestCollectMetrics_TotalMemory(t *testing.T) {
	metrics, err := CollectMetrics()
	if err != nil {
		t.Fatalf("Помилка при зборі метрик: %v", err)
	}

	if metrics.TotalMemoryMB == 0 {
		t.Errorf("TotalMemoryMB не повинен бути 0")
	}
}

func TestCollectMetrics_ProcessesNotEmpty(t *testing.T) {
	metrics, _ := CollectMetrics()
	if len(metrics.Processes) == 0 {
		t.Fatalf("Список процесів не повинен бути порожнім")
	}

	first := metrics.Processes[0]
	if first.PID <= 0 {
		t.Errorf("PID має бути більше 0, отримано: %d", first.PID)
	}
	if first.Name == "" {
		t.Errorf("Name процесу не повинен бути порожнім")
	}
	if first.MemoryUsedMB <= 0 {
		t.Errorf("MemoryUsedMB має бути більше 0, отримано: %f", first.MemoryUsedMB)
	}
	if first.MemoryUsedPercent < 0 || first.MemoryUsedPercent > 100 {
		t.Errorf("MemoryUsedPercent має бути в межах 0–100, отримано: %f", first.MemoryUsedPercent)
	}
}
