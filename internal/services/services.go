package services

import (
	"net/http"

	"github.com/kimsh02/kay-phos/internal/config"
	"github.com/kimsh02/kay-phos/internal/models"
)

// render html templates
func RenderTemplate(w http.ResponseWriter, tmpl string, p *models.Page) {
	// t, err := template.ParseFiles(path.Tmpl + tmpl + ".html")
	err := config.Tmpls.ExecuteTemplate(w, tmpl+".html", p)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	// err = t.Execute(w, p)
}
