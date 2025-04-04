package middleware

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"os"
)

func ValidateTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Attempt to grab the token cookie
		tokenString, err := c.Cookie("token")
		if err != nil {
			fmt.Println("Error in retrieving token.")
			c.HTML(http.StatusUnauthorized, "unauthorized.html", gin.H{
				"title":   "Access Denied",
				"message": "Please login to continue.",
			})
			c.Abort()
			return
		}

		//Parse and Validate the JWT
		claims := &jwt.RegisteredClaims{}
		parsedToken, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			secret := os.Getenv("JWT_SECRET")
			return []byte(secret), nil
		})

		if err != nil || !parsedToken.Valid {
			fmt.Println("Error in validating token.")
			c.HTML(http.StatusUnauthorized, "unauthorized.html", gin.H{
				"title":   "Access Denied",
				"message": "Your session is invalid or has expired. Please login again.",
			})
			c.Abort()
			return
		}

		// ✅ Passed all checks
		c.Next()
	}
}
