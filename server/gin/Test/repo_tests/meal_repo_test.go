package repo_tests

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
	"github.com/stretchr/testify/assert"
)

func TestInsertMeal(t *testing.T) {
	db := GetTestDB() // This assumes you have a helper to get a test DB pool
	userID := uuid.New()
	foodCode := 1001
	err := repositories.InsertMeal(db, userID, foodCode, time.Now())
	assert.NoError(t, err)
}

func TestGetMealsByUserID(t *testing.T) {
	db := GetTestDB()
	userID := uuid.New()
	_, err := repositories.GetMealsByUserID(db, userID)
	assert.NoError(t, err)
}

func TestDeleteMeal(t *testing.T) {
	db := GetTestDB()
	userID := uuid.New()
	foodCode := 1001
	err := repositories.DeleteMeal(db, userID, foodCode)
	assert.NoError(t, err)
}
