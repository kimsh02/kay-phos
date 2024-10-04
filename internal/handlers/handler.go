package handlers

import (
	"net/http"

	"github.com/kimsh02/kay-phos/internal/models"
	"github.com/kimsh02/kay-phos/internal/services"
)

// define one Handler type that contains all handler functions
type Handler struct{}

// return a new Handler
func NewHandler() *Handler {
	return &Handler{}
}

// hi handler
// func (h *Handler) HiHandler(w http.ResponseWriter, r *http.Request) {
// 	fmt.Fprintf(w, "hi there, i love %s", r.URL.Path[1:])
// }

// view Page handler
func (h *Handler) ViewPageHandler(w http.ResponseWriter, r *http.Request) {
	title, err := services.GetTitle(w, r)
	if err != nil {
		return
	}
	p, err := models.LoadPage(title)
	if err != nil {
		http.Redirect(w, r, "/edit/"+title, http.StatusFound)
		return
	}
	services.RenderTemplate(w, "view", p)
}

// edit Page handler
func (h *Handler) EditPageHandler(w http.ResponseWriter, r *http.Request) {
	title, err := services.GetTitle(w, r)
	if err != nil {
		return
	}
	p, err := models.LoadPage(title)
	if err != nil {
		p = &models.Page{Title: title}
	}
	services.RenderTemplate(w, "edit", p)
}

// save Page handler
func (h *Handler) SavePageHandler(w http.ResponseWriter, r *http.Request) {
	title, err := services.GetTitle(w, r)
	if err != nil {
		return
	}
	body := r.FormValue("body")
	p := &models.Page{Title: title, Body: []byte(body)}
	err = p.Save()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, "/view/"+title, http.StatusFound)
}
