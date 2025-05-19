package main

import (
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	"time"
)

type Metrics struct {
	CPUUsagePercent   float64  `json:"cpu_usage_percent"`
	MemoryUsedMB      uint64   `json:"memory_used_mb"`
	MemoryUsedPercent float64  `json:"memory_used_percent"`
	Timestamp         string   `json:"timestamp"`
	Processes         []string `json:"processes"`
}

func CollectMetrics() (*Metrics, error) {
	// CPU
	cpuPercentage, err := cpu.Percent(0, false)
	if err != nil {
		return nil, err
	}

	//Memory
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	// Processes
	allProcs, err := process.Processes()
	if err != nil {
		return nil, err
	}

	var processNames []string
	for _, p := range allProcs {
		name, err := p.Name()
		if err != nil {
			continue
		}
		processNames = append(processNames, name)
	}

	metrics := &Metrics{
		CPUUsagePercent:   cpuPercentage[0],
		MemoryUsedMB:      vmStat.Used / 1024 / 1024,
		MemoryUsedPercent: vmStat.UsedPercent,
		Timestamp:         time.Now().Format(time.RFC3339),
		Processes:         processNames,
	}

	return metrics, nil
}
