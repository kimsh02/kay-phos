package router

import (
	"net/http"

	"github.com/kimsh02/kay-phos/internal/handlers"
	"github.com/kimsh02/kay-phos/internal/services"
)

// initalize routes for all handlers
func Init() {
	// init new handler
	h := handlers.NewHandler()

	// http.HandleFunc("/", h.HiHandler)
	http.HandleFunc("/", services.MakeHandler((h.RootHandler)))
	http.HandleFunc("/view/", services.MakeHandler(h.ViewPageHandler))
	http.HandleFunc("/edit/", services.MakeHandler(h.EditPageHandler))
	http.HandleFunc("/save/", services.MakeHandler(h.SavePageHandler))
}
