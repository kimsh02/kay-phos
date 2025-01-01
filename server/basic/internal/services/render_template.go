package services

import (
	"html/template"
	"net/http"

	"github.com/kimsh02/kay-phos/server/basic/internal/models"
	"github.com/kimsh02/kay-phos/server/basic/internal/path"
)

/*
 * render_template.go renders html templates for handlers
 */

// slice of html template files
var tmpl_files = []string{"view.html", "edit.html"}

// list of html template Templates
var tmpls *template.Template = getTmpls()

// parse all html template Templates on startup
func getTmpls() *template.Template {
	for i, v := range tmpl_files {
		tmpl_files[i] = path.Tmpl + v
	}
	return template.Must(template.ParseFiles(tmpl_files...))
}

// render html templates
func RenderTemplate(w http.ResponseWriter, tmpl string, p *models.Page) {
	// t, err := template.ParseFiles(path.Tmpl + tmpl + ".html")
	err := tmpls.ExecuteTemplate(w, tmpl+".html", p)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	// err = t.Execute(w, p)
}
