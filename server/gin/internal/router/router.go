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

	return router
}

func InitStatic(router *gin.Engine) {
	// Serve frontend js files
	router.Static("/public/js", "./public/js")
	// Serve ico
	router.Static("/public/ico", "./public/ico")
	// Serve css
	router.Static("/public/css", "./public/css")
	// Serve images
	router.Static("/public/images", "./public/images")
}

func InitRoutes(router *gin.Engine, app *handlers.App) {

	// Setup entry route
	router.GET("/", handlers.Login)

	// Setup API routes
	api := router.Group("/api")
	{
		// example
		api.GET("/albums", handlers.GetAlbums)
		api.POST("/albums", handlers.PostAlbums)
		api.GET("/albums/:id", handlers.GetAlbumByID)

		// users
		api.GET("/login", app.VerifyUser)
		api.POST("/new-account", app.CreateUser)

		// fndds
		// TODO: support json requests
		api.GET("/fndds/:query", app.SearchFnddsFoodItems)
	}
}
