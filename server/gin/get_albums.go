package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAlbums(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, Albums)

}
