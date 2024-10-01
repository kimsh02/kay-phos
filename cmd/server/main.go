package main

import (
	"log"
	"net/http"

	"github.com/kimsh02/kay-phos/internal/config"
	"github.com/kimsh02/kay-phos/internal/router"
)

func main() {
	// set all startup configuration variables
	config.Init()
	// set all routes for all handlers
	router.Init()

	// startup server
	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
