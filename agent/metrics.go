package main

import (
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	"os"
)

type Metrics struct {
	HostName          string   `json:"hostname"`
	CPUUsagePercent   float64  `json:"cpu_usage_percent"`
	MemoryUsedMB      uint64   `json:"memory_used_mb"`
	MemoryUsedPercent float64  `json:"memory_used_percent"`
	TotalMemoryMB     uint64   `json:"memory_max"`
	Processes         []string `json:"processes"`
}

func CollectMetrics() (*Metrics, error) {
	hostName, err := os.Hostname()
	if err != nil {
		hostName = "unknown"
	}

	cpuPercentage, err := cpu.Percent(0, false)
	if err != nil {
		return nil, err
	}

	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

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
		HostName:          hostName,
		CPUUsagePercent:   cpuPercentage[0],
		MemoryUsedMB:      vmStat.Used / 1024 / 1024,
		MemoryUsedPercent: vmStat.UsedPercent,
		TotalMemoryMB:     vmStat.Total / 1024 / 1024,
		Processes:         processNames,
	}

	return metrics, nil
}
