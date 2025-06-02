package main

import (
	"github.com/joho/godotenv"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	"log"
	"os"
)

type Metrics struct {
	HostName          string        `json:"hostname"`
	UserName          string        `json:"username"`
	CPUUsagePercent   float64       `json:"cpu_usage_percent"`
	MemoryUsedMB      uint64        `json:"memory_used_mb"`
	MemoryUsedPercent float64       `json:"memory_used_percent"`
	TotalMemoryMB     uint64        `json:"memory_max"`
	Processes         []ProcessInfo `json:"processes"`
}

type ProcessInfo struct {
	PID               int32   `json:"pid"`
	Name              string  `json:"name"`
	MemoryUsedMB      float32 `json:"memory_used_mb"`
	MemoryUsedPercent float32 `json:"memory_used_percent"`
}

func CollectMetrics() (*Metrics, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

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

	processes, err := process.Processes()
	if err != nil {
		return nil, err
	}

	var processList []ProcessInfo
	for _, p := range processes {
		name, err := p.Name()
		if err != nil {
			continue
		}
		pid := p.Pid

		memInfo, err := p.MemoryInfo()
		if err != nil {
			continue
		}
		memoryUsedMB := float32(memInfo.RSS) / 1024 / 1024
		memoryUsedPercent := (float32(memInfo.RSS) / float32(vmStat.Total)) * 100

		processList = append(processList, ProcessInfo{
			PID:               pid,
			Name:              name,
			MemoryUsedMB:      memoryUsedMB,
			MemoryUsedPercent: memoryUsedPercent,
		})
	}

	metrics := &Metrics{
		HostName:          hostName,
		UserName:          os.Getenv("METRICS_USERNAME"),
		CPUUsagePercent:   cpuPercentage[0],
		MemoryUsedMB:      vmStat.Used / 1024 / 1024,
		MemoryUsedPercent: vmStat.UsedPercent,
		TotalMemoryMB:     vmStat.Total / 1024 / 1024,
		Processes:         processList,
	}

	return metrics, nil
}
