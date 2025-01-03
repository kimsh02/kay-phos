package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
)

func NewRouter() *gin.Engine {
	// Set the router as the default one shipped with Gin
	router := gin.Default()
	expectedHost := "localhost:8080"

	// Setup Security Headers
	router.Use(func(c *gin.Context) {
		if c.Request.Host != expectedHost {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid host header"})
			return
		}
		c.Header("X-Frame-Options", "DENY")
		c.Header("Content-Security-Policy", "default-src 'self'; connect-src *; font-src *; script-src-elem * 'unsafe-inline'; img-src * data:; style-src * 'unsafe-inline';")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		c.Header("Referrer-Policy", "strict-origin")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Permissions-Policy", "geolocation=(),midi=(),sync-xhr=(),microphone=(),camera=(),magnetometer=(),gyroscope=(),fullscreen=(self),payment=()")
		c.Next()
	})

	// Serve frontend static files
	// router.Use(static.Serve("/", static.LocalFile("./public/", true)))

	return router
}

func InitRoutes(router *gin.Engine) {
	// Setup route group for the API
	api := router.Group("/api")
	{
		api.GET("/albums", handlers.GetAlbums)
		api.POST("/albums", handlers.PostAlbums)
		api.GET("/albums/:id", handlers.GetAlbumByID)
	}
}
