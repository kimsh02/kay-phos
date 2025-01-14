package handlers

import (
	"github.com/gin-gonic/gin"
)

/*
 * Handles entry routes
 */

func LoginPage(c *gin.Context) {
	c.File("./public/html/login.html")
}

func NewAccountPage(c *gin.Context) {
	c.File("./public/html/new-account.html")
}
