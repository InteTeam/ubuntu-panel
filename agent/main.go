package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/InteTeam/upanel-agent/health"
	"github.com/InteTeam/upanel-agent/sender"
)

const (
	DefaultHeartbeatInterval = 60 * time.Second
	DefaultHealthPort        = "8443"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Printf("UPanel Agent v%s starting...", sender.AgentVersion)

	// Required environment variables
	panelURL := os.Getenv("PANEL_URL")
	agentToken := os.Getenv("AGENT_TOKEN")
	serverID := os.Getenv("SERVER_ID")

	if panelURL == "" || agentToken == "" || serverID == "" {
		log.Fatal("Required environment variables: PANEL_URL, AGENT_TOKEN, SERVER_ID")
	}

	// Optional health port
	healthPort := os.Getenv("HEALTH_PORT")
	if healthPort == "" {
		healthPort = DefaultHealthPort
	}

	// Create heartbeat sender
	heartbeatSender := sender.NewSender(panelURL, agentToken, serverID)

	// Start health server in background
	healthServer := health.NewServer(healthPort)
	go func() {
		if err := healthServer.Start(); err != nil {
			log.Printf("Health server error: %v", err)
		}
	}()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Create ticker for heartbeats
	ticker := time.NewTicker(DefaultHeartbeatInterval)
	defer ticker.Stop()

	// Send initial heartbeat immediately
	log.Println("Sending initial heartbeat...")
	if err := heartbeatSender.Send(); err != nil {
		log.Printf("Initial heartbeat failed: %v", err)
	}

	log.Printf("Heartbeat interval: %v", DefaultHeartbeatInterval)

	// Main loop
	for {
		select {
		case <-ticker.C:
			if err := heartbeatSender.Send(); err != nil {
				log.Printf("Heartbeat failed: %v", err)
			}
		case sig := <-sigChan:
			log.Printf("Received signal %v, shutting down...", sig)
			return
		}
	}
}
