package models

import (
	"fmt"
	"os"

	"github.com/kimsh02/kay-phos/internal/path"
)

// a Page in our web app
type Page struct {
	Title string
	Body  []byte
}

// save a Page to the server
func (p *Page) Save() error {
	filename := p.Title + ".txt"
	return os.WriteFile(path.Repo+filename, p.Body, 0600)
}

// load a Page from the server
func LoadPage(title string) (*Page, error) {
	filename := title + ".txt"
	body, err := os.ReadFile(path.Repo + filename)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &Page{Title: title, Body: body}, nil
}
