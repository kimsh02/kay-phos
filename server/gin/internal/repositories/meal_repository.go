package repositories

import (
	"context"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"log"
	"time"
)

// InsertMeal inserts a single meal record for a user into the meals table
func InsertMeal(dbPool *pgxpool.Pool, userID uuid.UUID, foodCode int, mealTime time.Time) error {
	_, err := dbPool.Exec(context.Background(),
		`INSERT INTO meals (user_id, food_code, time) VALUES ($1, $2, $3);`,
		userID, foodCode, mealTime)
	log.Printf("📦 Inserting ingredient:")
	return err
}

// GetMealsByUserID fetches all meals for a given user ID
func GetMealsByUserID(dbPool *pgxpool.Pool, userID uuid.UUID, mealType string) ([]models.MealEntry, error) {
	query := `
	SELECT meal_name, time, ingredients, totals
	FROM meals
	WHERE user_id = $1 AND meal_type = $2
	ORDER BY time DESC;
	`

	rows, err := dbPool.Query(context.Background(), query, userID, mealType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var meals []models.MealEntry
	for rows.Next() {
		var m models.MealEntry
		var ingredients []models.Ingredient
		var totals map[string]float64

		if err := rows.Scan(&m.MealName, &m.Time, &ingredients, &totals); err != nil {
			return nil, err
		}

		// Optional: convert totals into fields
		m.Calories = totals["calories"]
		m.Protein = totals["protein"]
		m.Carbs = totals["carbs"]
		m.Phosphorus = totals["phosphorus"]
		m.Potassium = totals["potassium"]

		// Attach first ingredient’s name as preview
		if len(ingredients) > 0 {
			m.Name = ingredients[0].Name
			m.Grams = ingredients[0].Grams
		}

		meals = append(meals, m)
	}
	return meals, nil
}

func InsertCustomMeal(dbPool *pgxpool.Pool, userID uuid.UUID, mealName string, mealTime time.Time, ingredients []models.Ingredient) error {
	// Calculate totals from ingredients
	var totalK, totalP, totalCals, totalPro, totalCarbs float64
	for _, ing := range ingredients {
		totalK += ing.Potassium
		totalP += ing.Phosphorus
		totalCals += ing.Calories
		totalPro += ing.Protein
		totalCarbs += ing.Carbs
	}

	totals := map[string]float64{
		"potassium":  totalK,
		"phosphorus": totalP,
		"calories":   totalCals,
		"protein":    totalPro,
		"carbs":      totalCarbs,
	}

	_, err := dbPool.Exec(context.Background(), `
		INSERT INTO meals (user_id, meal_name, time, meal_type, ingredients, totals)
		VALUES ($1, $2, $3, 'favorite', $4, $5);
	`, userID, mealName, mealTime, ingredients, totals)

	log.Printf("💾 InsertCustomMeal (favorite): name=%s user=%s time=%v", mealName, userID, mealTime)
	return err
}

type DailyNutrientTotals struct {
	Date        time.Time `json:"date"`
	Potassium   float64   `json:"potassiumTotal"`
	Phosphorous float64   `json:"phosphorousTotal"`
}

func FetchNutrientHistory(db *pgxpool.Pool, userID uuid.UUID, start, end string) ([]DailyNutrientTotals, error) {
	query := `
		SELECT 
			DATE(time) AS date,
			SUM((totals->>'potassium')::float) AS potassium,
			SUM((totals->>'phosphorus')::float) AS phosphorous
		FROM meals
		WHERE user_id = $1 AND meal_type = 'history' AND time BETWEEN $2 AND $3
		GROUP BY DATE(time)
		ORDER BY DATE(time)
	`

	rows, err := db.Query(context.Background(), query, userID, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []DailyNutrientTotals
	for rows.Next() {
		var d DailyNutrientTotals
		if err := rows.Scan(&d.Date, &d.Potassium, &d.Phosphorous); err != nil {
			return nil, err
		}
		results = append(results, d)
	}
	return results, nil
}

func InsertLoggedMeal(dbPool *pgxpool.Pool, userID uuid.UUID, mealName string, mealTime time.Time, ingredients []models.Ingredient) error {
	// Calculate totals
	var totalK, totalP, totalCals, totalPro, totalCarbs float64
	for _, ing := range ingredients {
		totalK += ing.Potassium
		totalP += ing.Phosphorus
		totalCals += ing.Calories
		totalPro += ing.Protein
		totalCarbs += ing.Carbs
	}

	totals := map[string]float64{
		"potassium":  totalK,
		"phosphorus": totalP,
		"calories":   totalCals,
		"protein":    totalPro,
		"carbs":      totalCarbs,
	}

	_, err := dbPool.Exec(context.Background(), `
		INSERT INTO meals (user_id, meal_name, time, meal_type, ingredients, totals)
		VALUES ($1, $2, $3, 'history', $4, $5);
	`, userID, mealName, mealTime, ingredients, totals)

	return err
}

func DeleteMealByName(dbPool *pgxpool.Pool, userID uuid.UUID, mealName string) error {
	cmdTag, err := dbPool.Exec(context.Background(),
		`DELETE FROM meals WHERE user_id = $1 AND meal_name = $2;`,
		userID, mealName)

	log.Printf("🧹 Deleted %d rows for meal name: %s", cmdTag.RowsAffected(), mealName)
	return err
}
