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
func GetMealsByUserID(dbPool *pgxpool.Pool, userID uuid.UUID) ([]models.MealEntry, error) {
	query := `
	SELECT meal_name, description, time, grams, calories, protein, carbs, phosphorus, potassium
	FROM meals
	WHERE user_id = $1
	ORDER BY time DESC;
	`

	rows, err := dbPool.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var meals []models.MealEntry
	for rows.Next() {
		var m models.MealEntry
		if err := rows.Scan(
			&m.MealName,
			&m.Name,
			&m.Time,
			&m.Grams,
			&m.Calories,
			&m.Protein,
			&m.Carbs,
			&m.Phosphorus,
			&m.Potassium,
		); err != nil {
			return nil, err
		}
		meals = append(meals, m)
	}
	return meals, nil
}

func InsertCustomMeal(dbPool *pgxpool.Pool, userID uuid.UUID, mealName string, mealTime time.Time, ing models.Ingredient) error {
	_, err := dbPool.Exec(context.Background(), `
	INSERT INTO meals (
		user_id, meal_name, time,
		description, grams, calories, protein, carbs,
		phosphorus, potassium
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
`,
		userID, mealName, mealTime,
		ing.Name, ing.Grams, ing.Calories, ing.Protein, ing.Carbs,
		ing.Phosphorus, ing.Potassium)
	log.Printf("🧠 InsertCustomMeal input: mealName=%s, time=%v, userID=%s, ingredient=%+v\n",
		mealName, mealTime, userID.String(), ing)

	return err
}

func DeleteMealByName(dbPool *pgxpool.Pool, userID uuid.UUID, mealName string) error {
	cmdTag, err := dbPool.Exec(context.Background(),
		`DELETE FROM meals WHERE user_id = $1 AND meal_name = $2;`,
		userID, mealName)

	log.Printf("🧹 Deleted %d rows for meal name: %s", cmdTag.RowsAffected(), mealName)
	return err
}
