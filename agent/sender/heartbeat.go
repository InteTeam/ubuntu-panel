package sender

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/InteTeam/upanel-agent/collector"
)

const (
	AgentVersion = "1.0.0"
	MaxRetries   = 3
	RetryDelay   = 5 * time.Second
)

// Heartbeat represents the data sent to the panel
type Heartbeat struct {
	ServerID   string                `json:"server_id"`
	Timestamp  time.Time             `json:"timestamp"`
	Metrics    *collector.Metrics    `json:"metrics"`
	Containers []collector.Container `json:"containers"`
	Version    string                `json:"agent_version"`
}

// HeartbeatResponse is the response from the panel
type HeartbeatResponse struct {
	Status                string `json:"status"`
	ServerTime            string `json:"server_time,omitempty"`
	NextHeartbeatSeconds  int    `json:"next_heartbeat_seconds,omitempty"`
	Message               string `json:"message,omitempty"`
}

// Sender handles sending heartbeats to the panel
type Sender struct {
	PanelURL   string
	AgentToken string
	ServerID   string
	Client     *http.Client
}

// NewSender creates a new heartbeat sender
func NewSender(panelURL, agentToken, serverID string) *Sender {
	// Create HTTP client with reasonable timeouts
	// Skip TLS verification for self-signed certs (can be made configurable)
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
	}

	client := &http.Client{
		Timeout:   30 * time.Second,
		Transport: transport,
	}

	return &Sender{
		PanelURL:   panelURL,
		AgentToken: agentToken,
		ServerID:   serverID,
		Client:     client,
	}
}

// Send collects metrics and sends a heartbeat to the panel
func (s *Sender) Send() error {
	// Collect system metrics
	metrics, err := collector.CollectMetrics()
	if err != nil {
		log.Printf("Warning: failed to collect metrics: %v", err)
		metrics = &collector.Metrics{} // Send empty metrics rather than failing
	}

	// Collect container list
	containers, err := collector.CollectContainers()
	if err != nil {
		log.Printf("Warning: failed to collect containers: %v", err)
		containers = []collector.Container{} // Send empty list rather than failing
	}

	heartbeat := Heartbeat{
		ServerID:   s.ServerID,
		Timestamp:  time.Now().UTC(),
		Metrics:    metrics,
		Containers: containers,
		Version:    AgentVersion,
	}

	return s.sendWithRetry(heartbeat)
}

func (s *Sender) sendWithRetry(heartbeat Heartbeat) error {
	var lastErr error

	for attempt := 1; attempt <= MaxRetries; attempt++ {
		err := s.sendOnce(heartbeat)
		if err == nil {
			return nil
		}

		lastErr = err
		log.Printf("Heartbeat attempt %d/%d failed: %v", attempt, MaxRetries, err)

		if attempt < MaxRetries {
			time.Sleep(RetryDelay)
		}
	}

	return fmt.Errorf("heartbeat failed after %d attempts: %w", MaxRetries, lastErr)
}

func (s *Sender) sendOnce(heartbeat Heartbeat) error {
	body, err := json.Marshal(heartbeat)
	if err != nil {
		return fmt.Errorf("failed to marshal heartbeat: %w", err)
	}

	url := fmt.Sprintf("%s/api/agent/heartbeat", s.PanelURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.AgentToken)
	req.Header.Set("User-Agent", "UPanel-Agent/"+AgentVersion)

	resp, err := s.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status %d: %s", resp.StatusCode, string(respBody))
	}

	var response HeartbeatResponse
	if err := json.Unmarshal(respBody, &response); err != nil {
		log.Printf("Warning: failed to parse response: %v", err)
		return nil // Don't fail on unparseable success response
	}

	if response.Status != "ok" {
		return fmt.Errorf("panel returned error: %s", response.Message)
	}

	log.Printf("Heartbeat sent successfully (CPU: %.1f%%, RAM: %dMB/%dMB)",
		heartbeat.Metrics.CPUPercent,
		heartbeat.Metrics.RAMUsedMB,
		heartbeat.Metrics.RAMTotalMB)

	return nil
}
