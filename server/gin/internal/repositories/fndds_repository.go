package repositories

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
)

// FnddsQuery performs an ILIKE fuzzy match on description
func FnddsQuery(db *pgxpool.Pool, ingredientName string) (*[]models.FnddsFoodItem, error) {
	query := `
		SELECT food_code, description, "Potassium (mg)", "Phosphorus (mg)"
		FROM fndds_nutrient_values
		WHERE description::text ILIKE '%' || $1 || '%'
		LIMIT 1;
	`

	rows, err := db.Query(context.Background(), query, ingredientName)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var items []models.FnddsFoodItem

	for rows.Next() {
		var item models.FnddsFoodItem
		if err := rows.Scan(&item.FoodCode, &item.Description, &item.Potassium, &item.Phosphorus); err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}
		items = append(items, item)
	}

	return &items, nil
}
