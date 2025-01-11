package handlers

import (
	"github.com/gin-gonic/gin"
)

/*
 * Handles login route
 */

func Login(c *gin.Context) {
	c.File("./public/html/login.html")
}
