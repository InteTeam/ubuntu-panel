package collector

import (
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
)

// Metrics represents system resource metrics
type Metrics struct {
	CPUPercent  float64 `json:"cpu_percent"`
	RAMUsedMB   uint64  `json:"ram_used_mb"`
	RAMTotalMB  uint64  `json:"ram_total_mb"`
	DiskUsedGB  uint64  `json:"disk_used_gb"`
	DiskTotalGB uint64  `json:"disk_total_gb"`
}

// CollectMetrics gathers current system metrics
func CollectMetrics() (*Metrics, error) {
	// CPU usage (1 second sample)
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, err
	}

	cpuPct := 0.0
	if len(cpuPercent) > 0 {
		cpuPct = cpuPercent[0]
	}

	// Memory usage
	memInfo, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	// Disk usage (root partition)
	diskInfo, err := disk.Usage("/")
	if err != nil {
		return nil, err
	}

	return &Metrics{
		CPUPercent:  cpuPct,
		RAMUsedMB:   memInfo.Used / 1024 / 1024,
		RAMTotalMB:  memInfo.Total / 1024 / 1024,
		DiskUsedGB:  diskInfo.Used / 1024 / 1024 / 1024,
		DiskTotalGB: diskInfo.Total / 1024 / 1024 / 1024,
	}, nil
}
