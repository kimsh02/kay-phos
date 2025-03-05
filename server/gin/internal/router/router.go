package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/kimsh02/kay-phos/server/gin/internal/middleware"
)

func NewRouter() *gin.Engine {
	// Set the router as the default one shipped with Gin
	router := gin.Default()
	expectedHosts := map[string]struct{}{
		"localhost:8080": {},
		"server:8080":    {},
	}

	// Setup Security Headers
	router.Use(func(c *gin.Context) {
		if _, ok := expectedHosts[c.Request.Host]; !ok {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid host header " + c.Request.Host})
			return
		}
		c.Header("X-Frame-Options", "DENY")
		c.Header("Content-Security-Policy", "default-src 'self'; connect-src *; font-src *; script-src-elem * 'unsafe-inline'; img-src * data: blob:; style-src * 'unsafe-inline';")
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

	// Set entry routes
	router.GET("/", handlers.LoginPage)
	router.POST("/", handlers.MakeUserHandler(app.LoginUser))
	router.GET("/new-account/", handlers.NewAccountPage)
	router.POST("/new-account/", handlers.MakeUserHandler(app.CreateUser))

	// Set protected routes
	api := router.Group("/dashboard/")
	{
		// Apply user session middleware
		api.Use(middleware.ValidateTokenMiddleware())

		api.GET("/", handlers.DashboardPage)
		api.GET("/manual-food-search/", handlers.ManualFoodSearchPage)
		api.GET("/ai-food-search/", handlers.AIFoodSearchPage)
		api.GET("/user-define-meal", handlers.UserDefineMealPage)
		api.GET("/user-meal-history", handlers.UserMealHistoryPage)
		// fndds
		// TODO: support json requests
		// test
		api.GET("/fndds/:query", app.SearchFnddsFoodItems)

	}

	// Invalid paths
	router.NoRoute(handlers.InvalidPath)
}
