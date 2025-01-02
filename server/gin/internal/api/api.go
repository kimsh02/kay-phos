package api

import (
	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
)

func InitAPIs(router *gin.Engine) {
	// Setup route group for the API
	api := router.Group("/api")
	{
		// apiHandler := func(c *gin.Context) {
		// 	c.JSON(http.StatusOK, gin.H{
		// 		"message": "Uniform API",
		// 	})
		// }
		api.GET("/albums", models.GetAlbums)
		api.POST("/albums", models.PostAlbums)
		api.GET("/albums/:id", models.GetAlbumByID)
	}
}

// func InitRoutes(r *gin.Engine) {
// 	r.GET("/albums", models.GetAlbums)
// 	r.POST("/albums", models.PostAlbums)
// }
