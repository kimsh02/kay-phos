package router

import (
	"net/http"

	"github.com/kimsh02/kay-phos/internal/handlers"
)

// initalize routes for all handlers
func Init() {
	// init new handler
	h := handlers.NewHandler()

	// http.HandleFunc("/", h.HiHandler)
	http.HandleFunc("/view/", h.ViewPageHandler)
	http.HandleFunc("/edit/", h.EditPageHandler)
	http.HandleFunc("/save/", h.SavePageHandler)
}
