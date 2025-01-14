package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/middleware"
)

/*
 * Handler for invalid paths
 */

func InvalidPath(c *gin.Context) {
	// Call token middleware
	middleware.ValidateTokenMiddleware()(c)
	// If user is logged in, stay on current page
	if !c.IsAborted() {
		c.Redirect(http.StatusFound, c.Request.Referer())
		return
	}
}
