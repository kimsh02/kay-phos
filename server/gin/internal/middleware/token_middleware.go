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
		tokenString := c.GetHeader("Authorization")
		// Abort if empty token
		if tokenString == "" {
			c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token not provided."})
			c.Abort()
			return
		}

		claims := &models.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return services.JwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token."})
			c.Abort()
			return
		}

		// Pass claims to the next handler
		c.Set("userid", claims.UserID)
		c.Next()
	}
}
