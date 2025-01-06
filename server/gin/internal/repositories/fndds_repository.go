package repositories

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
)

/*
 * fndds_repository interacts with fndds nutrient values table in postgres
 */

func FnddsQuery(dbPool *pgxpool.Pool, query string) (*[]models.FnddsFoodItem, error) {
	// Query db
	rows, err := dbPool.Query(context.Background(), "fndds_search_query", query)
	if err != nil {
		log.Println("Error in executing query.")
		log.Println(err)
		return nil, err
	}
	defer rows.Close()

	// Build Fndds food item slice
	food_items := make([]models.FnddsFoodItem, 0)
	for rows.Next() {
		var fi models.FnddsFoodItem
		if err := rows.Scan(&fi.FoodCode, &fi.Description, &fi.Phosphorus, &fi.Potassium); err != nil {
			return nil, err
		}
		food_items = append(food_items, fi)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return &food_items, nil
}
