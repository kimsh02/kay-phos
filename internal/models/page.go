package models

import (
	"fmt"
	"os"
)

// a Page in our web app
type Page struct {
	Title string
	Body  []byte
}

// repositories folder path from main.go
const rpath = "internal/repositories/"

// save a Page to the server
func (p *Page) Save() error {
	filename := p.Title + ".txt"
	return os.WriteFile(rpath+filename, p.Body, 0600)
}

// load a Page from the server
func LoadPage(title string) (*Page, error) {
	filename := title + ".txt"
	body, err := os.ReadFile(rpath + filename)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &Page{Title: title, Body: body}, nil
}
