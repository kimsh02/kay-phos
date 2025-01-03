package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/kimsh02/kay-phos/server/gin/internal/router"
)

func main() {
	// Initialize HTTP port
	httpPort := os.Getenv("API_PORT")
	if httpPort == "" {
		httpPort = "8080"
	}

	// Initialize router
	r := router.NewRouter()

	// Initialize APIs
	router.InitRoutes(r)

	// Create server with timeout
	srv := &http.Server{
		Addr:    ":" + httpPort,
		Handler: r,
		// set timeout due CWE-400 - Potential Slowloris Attack
		ReadHeaderTimeout: 5 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Printf("Failed to start server: %v", err)
	}

	// do not trust any proxies
	// r.SetTrustedProxies(nil)

	// set server to release mode
	// gin.SetMode(gin.ReleaseMode)
}
