package handlers

import "github.com/gin-gonic/gin"

/*
 * Handler for user dashboard
 */

func (app *App) DashboardPage(c *gin.Context) {
	c.File("./public/html/dashboard.html")
}
