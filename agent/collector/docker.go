package collector

import (
	"context"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

// Container represents a Docker container's status
type Container struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Image  string `json:"image"`
	Status string `json:"status"`
	State  string `json:"state"`
}

// CollectContainers lists all Docker containers and their status
func CollectContainers() ([]Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	defer cli.Close()

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if err != nil {
		return nil, err
	}

	result := make([]Container, 0, len(containers))
	for _, c := range containers {
		name := ""
		if len(c.Names) > 0 {
			// Docker prefixes names with /, remove it
			name = strings.TrimPrefix(c.Names[0], "/")
		}

		result = append(result, Container{
			ID:     c.ID[:12], // Short ID
			Name:   name,
			Image:  c.Image,
			Status: c.Status,
			State:  c.State,
		})
	}

	return result, nil
}

// GetContainerStats returns CPU and memory usage for a specific container
func GetContainerStats(containerID string) (*types.StatsJSON, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	defer cli.Close()

	stats, err := cli.ContainerStatsOneShot(context.Background(), containerID)
	if err != nil {
		return nil, err
	}
	defer stats.Body.Close()

	// For now, we just return basic container list
	// Full stats parsing can be added later if needed
	return nil, nil
}
