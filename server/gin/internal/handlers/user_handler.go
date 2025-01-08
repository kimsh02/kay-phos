package handlers

import (
	"log"
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

// verify User trying to log in
func (app *App) VerifyUser(c *gin.Context) {
	var user models.User
	// Bind username and password to user model
	if err := c.ShouldBindJSON(&user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Verify the user
	if err := repositories.GetUser(app.DBPool, &user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, user)
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
	// Basic check if password is empty string
	password := c.Param("password")
	if password == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "No password given."})
		return
	}
	// set user hashed password and uuid
	log.Println("Password is " + password + ".")
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
