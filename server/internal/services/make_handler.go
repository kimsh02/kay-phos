package services

import (
	"net/http"
)

/*
 *  make_handler.go returns handler functions to reduce code of actual handlers
 */

// returns an http.HandlerFunc
func MakeHandler(fn func(w http.ResponseWriter, r *http.Request, title string)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if m, err := validatePath(w, r); err == nil {
			fn(w, r, m)
		}
	}
}
