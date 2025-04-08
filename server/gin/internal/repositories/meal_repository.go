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
	return err
}

// GetMealsByUserID fetches all meals for a given user ID
func GetMealsByUserID(dbPool *pgxpool.Pool, userID uuid.UUID) ([]models.FnddsMeal, error) {
	query := `
	SELECT m.food_code, f.description, f."Potassium (mg)", f."Phosphorus (mg)", m.time
	FROM meals m
	JOIN fndds_nutrient_values f ON m.food_code = f."Food code"
	WHERE m.user_id = $1
	ORDER BY m.time DESC;
`

	rows, err := dbPool.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var meals []models.FnddsMeal
	for rows.Next() {
		var meal models.FnddsMeal
		if err := rows.Scan(&meal.FoodCode, &meal.Description, &meal.Potassium, &meal.Phosphorus, &meal.Time); err != nil {
			return nil, err
		}
		meals = append(meals, meal)
	}
	return meals, nil
}

func DeleteMeal(dbPool *pgxpool.Pool, userID uuid.UUID, foodCode int) error {
	log.Printf("🔨 Deleting meal for user %s with food_code %d\n", userID, foodCode)
	cmdTag, err := dbPool.Exec(context.Background(),
		`DELETE FROM meals WHERE user_id = $1 AND food_code = $2;`,
		userID, foodCode)
	log.Printf("Deleted %d rows", cmdTag.RowsAffected())
	return err
}
