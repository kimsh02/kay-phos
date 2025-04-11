package test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kimsh02/kay-phos/server/gin/internal/middleware"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/stretchr/testify/assert"
)

func generateTestToken(secret string, userID string) string {
	claims := models.Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Minute * 5)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, _ := token.SignedString([]byte(secret))
	return signedToken
}

func TestValidateTokenMiddleware_Success(t *testing.T) {
	err := os.Setenv("JWT_SECRET", "testsecret")
	if err != nil {
		return
	}
	router := gin.Default()
	router.Use(middleware.ValidateTokenMiddleware())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	token := generateTestToken("testsecret", "user123")
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestValidateTokenMiddleware_MissingToken(t *testing.T) {
	err := os.Setenv("JWT_SECRET", "testsecret")
	if err != nil {
		return
	}
	router := gin.Default()
	router.Use(middleware.ValidateTokenMiddleware())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "should not reach"})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestValidateTokenMiddleware_InvalidToken(t *testing.T) {
	err := os.Setenv("JWT_SECRET", "testsecret")
	if err != nil {
		return
	}
	router := gin.Default()
	router.Use(middleware.ValidateTokenMiddleware())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "should not reach"})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: "invalid-token"})
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
