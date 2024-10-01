package main

import (
	"fmt"

	"github.com/kimsh02/kay-phos/internal/models"
)

func main() {
	fmt.Println("hello")
	p1 := &models.Page{
		Title: "testpage",
		Body:  []byte("this is a sample page.")}
	p1.Save()
	p2, _ := models.LoadPage("testpage")
	fmt.Println(string(p2.Body))
}
