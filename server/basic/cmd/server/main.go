package main

import (
	"log"
	"net/http"

	"github.com/kimsh02/kay-phos/server/basic/internal/router"
)

func main() {
	// set all routes for all handlers
	router.Init()

	// startup the server
	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
