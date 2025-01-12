package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/services"
)

/*
 * User JWT token middleware
 */

func ValidateTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("token")
		// Abort if empty token
		if err != nil {
			// c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.SetCookie("accountStatus", "not logged in", 15, "/", "localhost", false, true) // Expires in 1 minute
			c.Redirect(http.StatusSeeOther, "/")
			c.Abort()
			return
		}
		// Verify token
		claims := &models.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return services.JwtSecret, nil
		})

		if err != nil || !token.Valid {
			// c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token."})
			c.SetCookie("accountStatus", "session expired", 15, "/", "localhost", false, true) // Expires in 1 minute
			c.Redirect(http.StatusSeeOther, "/")
			c.Abort()
			return
		}

		// Pass claims to the next handler
		c.Set("userid", claims.UserID)
		c.Next()
	}
}
