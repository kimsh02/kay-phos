package main

import "github.com/gin-gonic/gin"

func main() {

	// gin framework server start and run
	router := gin.Default()

	// endpoint path to get albums
	router.GET("/albums", GetAlbums)

	// default port 8080
	router.Run("localhost:8080")
}
