package services

import (
	"errors"
	"net/http"
	"regexp"
)

/*
 * validator.go validates path that client user supplies
 */

var validPath = regexp.MustCompile("^/(edit|save|view)/([a-zA-Z0-9]+)$")

func validatePath(w http.ResponseWriter, r *http.Request) (string, error) {
	// if root path
	if r.URL.Path == "/" {
		// http.Redirect(w, r, "/view/FrontPage", http.StatusOK)
		return "", nil
	}
	// if valid url path
	m := validPath.FindStringSubmatch(r.URL.Path)
	if m == nil {
		http.NotFound(w, r)
		return "", errors.New("invalid Page Title")
	}
	return m[2], nil // the title is the second subexpression
}
