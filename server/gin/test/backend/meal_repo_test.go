// meal_repo_test.go
//
// ✅ What This Tests
// - InsertCustomMeal() → saves a user-defined favorite meal
// - InsertLoggedMeal() → logs a real meal with ingredients + totals
// - GetMealsByUserID() → retrieves meals by user ID and mealType
// - DeleteMealByName() → removes a named meal for a user
//
// 🧪 What’s Covered in This Pattern
// ✅ Database interaction (insert → retrieve → delete)
// ✅ Distinct mealType handling: "favorite" vs "history"
// ✅ Basic model integrity (Ingredient + MealEntry)
//
// 🧪 What’s NOT Covered
// ❌ Foreign key constraints (users table assumed dummy-safe)
// ❌ Time-based queries (mealTime filtering)
// ❌ Duplicate handling (inserts overwrite not tested)

package backend

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
	"github.com/kimsh02/kay-phos/server/gin/test/backend/testdb"
	"github.com/stretchr/testify/assert"
)

func TestInsertAndRetrieveCustomMeal(t *testing.T) {
	pool := testdb.SetupTestDB(t)
	userID := uuid.New()

	ingredients := []models.Ingredient{
		{
			Name:       "Rice",
			Grams:      100,
			Calories:   130,
			Protein:    2.6,
			Carbs:      28,
			Potassium:  35,
			Phosphorus: 40,
		},
		{
			Name:       "Tofu",
			Grams:      80,
			Calories:   144,
			Protein:    12,
			Carbs:      3,
			Potassium:  120,
			Phosphorus: 100,
		},
	}

	err := repositories.InsertCustomMeal(pool, userID, "My Favorite Tofu Bowl", time.Now(), ingredients)
	assert.NoError(t, err)

	// ✅ Fetch meals
	meals, err := repositories.GetMealsByUserID(pool, userID, "favorite")
	assert.NoError(t, err)
	assert.NotEmpty(t, meals)

	found := false
	for _, m := range meals {
		if m.MealName == "My Favorite Tofu Bowl" {
			found = true
			assert.Len(t, meals, 2)
			assert.InDelta(t, 274.0, m.Calories, 0.5)
			break
		}
	}
	assert.True(t, found, "Inserted custom meal not found")
}

func TestInsertAndDeleteLoggedMeal(t *testing.T) {
	pool := testdb.SetupTestDB(t)
	userID := uuid.New()

	ingredients := []models.Ingredient{
		{
			Name:       "Chicken",
			Grams:      150,
			Calories:   300,
			Protein:    30,
			Carbs:      0,
			Potassium:  350,
			Phosphorus: 200,
		},
	}

	err := repositories.InsertLoggedMeal(pool, userID, "Lunch Chicken", time.Now(), ingredients)
	assert.NoError(t, err)

	// ✅ Delete the meal
	err = repositories.DeleteMealByName(pool, userID, "Lunch Chicken")
	assert.NoError(t, err)

	// ✅ Verify it's gone
	meals, err := repositories.GetMealsByUserID(pool, userID, "history")
	assert.NoError(t, err)
	for _, m := range meals {
		assert.NotEqual(t, "Lunch Chicken", m.MealName, "Meal should be deleted")
	}
}
