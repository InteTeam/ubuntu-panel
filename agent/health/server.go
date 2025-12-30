package health

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/InteTeam/upanel-agent/sender"
)

// Response represents the health check response
type Response struct {
	Status    string `json:"status"`
	Version   string `json:"version"`
	Timestamp string `json:"timestamp"`
}

// Server handles health check requests
type Server struct {
	Port string
}

// NewServer creates a new health check server
func NewServer(port string) *Server {
	return &Server{Port: port}
}

// Start starts the health check HTTP server
func (s *Server) Start() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", s.handleHealth)
	mux.HandleFunc("/", s.handleHealth) // Also respond on root

	server := &http.Server{
		Addr:         ":" + s.Port,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	log.Printf("Health server listening on :%s", s.Port)
	return server.ListenAndServe()
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := Response{
		Status:    "ok",
		Version:   sender.AgentVersion,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
