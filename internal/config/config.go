package config

import (
	"html/template"

	"github.com/kimsh02/kay-phos/internal/path"
)

// slice of html template files
var tmpl_files = []string{"view.html", "edit.html"}

// list of html template Templates
var Tmpls *template.Template

// init Configuration
func Init() {
	initTmpls()
}

// parse all html template Templates on startup
func initTmpls() {
	for i, v := range tmpl_files {
		tmpl_files[i] = path.Tmpl + v
	}
	Tmpls = template.Must(template.ParseFiles(tmpl_files...))
}
