package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
	"github.com/kimsh02/kay-phos/server/gin/internal/services"
)

/*
 * handler for User
 */

// checks for unique username
// func (app *App) userNameExists(username *string) bool {
// 	return repositories.CheckUserNameExists(app.DBPool, username)
// }

// User handler generator
func MakeUserHandler(fn func(*gin.Context, *models.User)) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		// Bind username and password to user model
		if err := c.ShouldBindJSON(&user); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Check for empty password or username
		if err := user.CheckPasswordAndUsername(); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fn(c, &user)
	}
}

// verify User logging in
func (app *App) LoginUser(c *gin.Context, user *models.User) {
	// Get user from db
	if err := repositories.GetUser(app.DBPool, user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Verify input password
	if !user.VerifyPassword() {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Password is invalid."})
		return
	}
	// Generate JWT for user
	token, err := services.GenerateToken(user)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token."})
		return
	}
	// Set token as a secure cookie and return success
	// TODO: change for https, change path, change domain
	c.SetCookie("token", token, 900, "/dashboard", "localhost", false, true) // 15 minutes expiration
	c.Redirect(http.StatusSeeOther, "/dashboard")
	// c.IndentedJSON(http.StatusOK, gin.H{"message": "Login successful."})
}

// creates new User with hashed password and generated uuid
func (app *App) CreateUser(c *gin.Context, user *models.User) {
	// Check if username already exists in the database, slightly faster
	// if app.userNameExists(&user.UserName) {
	// 	c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Username already exists."})
	// 	return
	// }
	// Check if username already exists in the database, more generic and more overhead
	if err := repositories.GetUser(app.DBPool, user); err == nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Username already exists."})
		return
	}
	// Set user hashed user.InputPassword and UUID
	if err := user.SetHashedPassword(); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user.SetUserID()
	// Insert user into db
	if err := repositories.CreateUser(app.DBPool, user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Set account created cookie and redirect to login
	c.SetCookie("accountStatus", "created", 15, "/login", "localhost", false, true) // Expires in 1 minute
	c.Redirect(http.StatusSeeOther, "/login")
	// c.IndentedJSON(http.StatusCreated, gin.H{"message": "User created successfully."})
}
