package handlers

import (
	"github.com/gin-gonic/gin"
)

/*
 * handles login route
 */

func Login(c *gin.Context) {
	// c.HTML(http.StatusOK, "./public/html/login.html", nil)
	// log.Println("here")
	c.File("./public/html/login.html")
}
