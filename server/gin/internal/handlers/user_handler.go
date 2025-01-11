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

// verify User logging in
func (app *App) LoginUser(c *gin.Context) {
	var user models.User
	// Bind username and password to user model
	if err := c.ShouldBindJSON(&user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Basic check if username is empty string
	if user.UserName == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "No username given."})
		return
	}
	// Basic check if password is empty string
	if user.InputPassword == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "No password given."})
		return
	}
	// Get user from db
	if err := repositories.GetUser(app.DBPool, &user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Verify input password
	if !user.VerifyPassword() {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Password is invalid."})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Login successful."})
}

// creates new User with hashed password and generated uuid
func (app *App) CreateUser(c *gin.Context) {
	var user models.User
	// bind json to user model
	if err := c.ShouldBindJSON(&user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Basic check if username is empty string
	if user.UserName == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "No username given."})
		return
	}
	// check if username already exists
	if app.userNameExists(&user.UserName) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Username already exists."})
		return
	}
	// Basic check if password is empty string
	if user.InputPassword == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "No password given."})
		return
	}
	// set user hashed user.InputPassword and uuid
	if err := user.SetHashedPassword(); err != nil {
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
