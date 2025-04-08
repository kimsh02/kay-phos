package repo_tests

import (
	"testing"

	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
	"github.com/stretchr/testify/assert"
)

func TestCreateAndGetUser(t *testing.T) {
	db := GetTestDB()
	user := &models.User{
		FirstName:     "Test",
		LastName:      "User",
		UserName:      "testuser123",
		InputPassword: "secure123",
	}
	user.SetUserID()
	err := user.SetHashedPassword()
	assert.NoError(t, err)

	err = repositories.CreateUser(db, user)
	assert.NoError(t, err)

	lookup := &models.User{UserName: user.UserName}
	err = repositories.GetUser(db, lookup)
	assert.NoError(t, err)
	assert.Equal(t, user.UserID, lookup.UserID)
}
