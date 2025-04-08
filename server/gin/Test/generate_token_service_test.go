package test

import (
	"os"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/services"
	"github.com/stretchr/testify/assert"
)

func TestGenerateToken(t *testing.T) {
	err := os.Setenv("JWT_SECRET", "testsecret")
	if err != nil {
		return
	}
	user := &models.User{
		UserID: uuid.New(),
	}

	tokenStr, err := services.GenerateToken(user)
	assert.NoError(t, err)
	assert.NotEmpty(t, tokenStr)

	parsedToken, err := jwt.ParseWithClaims(tokenStr, &models.Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("testsecret"), nil
	})
	assert.NoError(t, err)
	assert.True(t, parsedToken.Valid)

	claims := parsedToken.Claims.(*models.Claims)
	assert.Equal(t, user.UserID.String(), claims.UserID)
}
