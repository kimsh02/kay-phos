package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/kimsh02/kay-phos/server/gin/internal/api"
	"github.com/kimsh02/kay-phos/server/gin/internal/router"
)

func main() {

	httpPort := os.Getenv("API_PORT")
	if httpPort == "" {
		httpPort = "8080"
	}

	// Initialize router
	router := router.NewRouter()

	// Initialize APIs
	api.InitAPIs(router)

	// Create server with timeout
	srv := &http.Server{
		Addr:    ":" + httpPort,
		Handler: router,
		// set timeout due CWE-400 - Potential Slowloris Attack
		ReadHeaderTimeout: 5 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Printf("Failed to start server: %v", err)
	}

	// gin framework server start and run
	// r := gin.Default()

	// do not trust any proxies
	// r.SetTrustedProxies(nil)

	// initialize routes
	// router.InitRoutes(r)

	// set server to release mode
	// gin.SetMode(gin.ReleaseMode)

	// default port 8080
	// r.Run("localhost:8080")
}
