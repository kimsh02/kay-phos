package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
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
	// Initialize db connection pool
	dbPool, err := repositories.New_DB_Connection_Pool()
	if err != nil {
		log.Println(err)
	}
	defer dbPool.Close()
	// Create server with timeout
	srv := &http.Server{
		Addr:    ":" + httpPort,
		Handler: r,
		// set timeout due CWE-400 - Potential Slowloris Attack
		ReadHeaderTimeout: 5 * time.Second,
	}
	// Make shutdown chan
	shutdownChan := make(chan bool, 1)
	// Start sever in a goroutine
	go func() {
		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Printf("Failed to start server: %v", err)
		}
		// Simulate time to close connections
		// time.Sleep(1 * time.Millisecond)
		log.Println("Stopped serving new connections.")
		shutdownChan <- true
	}()
	// Graceful shutdown on kill signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	shutdownCtx, shutdownRelease := context.WithTimeout(context.Background(), 3*time.Second)
	defer shutdownRelease()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("HTTP shutdown error: %v", err)
	}
	<-shutdownChan
	log.Println("Server shutting down...")
	// srv.Shutdown(context.Background())

	// do not trust any proxies
	// r.SetTrustedProxies(nil)

	// set server to release mode
	// gin.SetMode(gin.ReleaseMode)
}
