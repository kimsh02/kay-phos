package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

		// Check expiration time
		if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
			if exp, ok := claims["exp"].(float64); ok {
				expTime := time.Unix(int64(exp), 0)
				if time.Now().After(expTime) {
					fmt.Println("🚫 Token expired")
					c.HTML(http.StatusUnauthorized, "unauthorized.html", gin.H{
						"title":   "Session Expired",
						"message": "Please log in again to continue.",
					})
					c.Abort()
					return
				}
			}
			// Optional: Set user info in context if needed
			if sub, ok := claims["sub"].(string); ok {
				c.Set("userID", sub)
			}
		} else {
			fmt.Println("🚫 Failed to extract claims")
			c.HTML(http.StatusUnauthorized, "unauthorized.html", gin.H{
				"title":   "Access Denied",
				"message": "Invalid session token.",
			})
			c.Abort()
			return
		}

		// ✅ Passed all checks
		c.Next()
	}
}
