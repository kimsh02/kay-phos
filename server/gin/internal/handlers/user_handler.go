package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
)

/*
 * handler for User
 */

// checks for unique username
func (app *App) userNameExists(username *string) bool {
	return repositories.CheckUserNameExists(app.DBPool, username)
}

// creates new User with hashed password and generated uuid
func (app *App) CreateUser(c *gin.Context) {
	var user models.User
	// bind json to user model
	if err := c.ShouldBindJSON(&user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// check if username already exists
	if app.userNameExists(&user.UserName) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Username already exists."})
		return
	}
	// set user hashed password and uuid
	password := c.Param("password")
	if err := user.SetHashedPassword(password); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user.SetUserID()
	// insert user into db
	if err := repositories.CreateUser(app.DBPool, &user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusCreated, gin.H{"message": "User created successfully."})
}
