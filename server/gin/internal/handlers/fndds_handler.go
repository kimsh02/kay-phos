package handlers

import (
	"context"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"math"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
)

// Handler for POST /dashboard/calculate-intake
func (a *App) CalculateIntake(c *gin.Context) {
	var req struct {
		SelectedFoods []struct {
			IngredientName string  `json:"ingredientName"`
			WeightGrams    float64 `json:"weightGrams"`
		} `json:"selectedFoods"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var totalK, totalP float64
	var breakdown []gin.H

	for _, food := range req.SelectedFoods {
		items, err := repositories.FnddsQuery(a.DBPool, food.IngredientName)
		if (err != nil || items == nil || len(*items) == 0) && len(food.IngredientName) > 5 {
			trimmedName := strings.Join(strings.Fields(food.IngredientName)[:1], " ") // fallback to first word e.g., "lemon"
			items, err = repositories.FnddsQuery(a.DBPool, trimmedName)
		}
		if err != nil || items == nil || len(*items) == 0 {
			continue // still skip if nothing
		}

		best := (*items)[0]
		k := (best.Potassium / 100) * food.WeightGrams
		p := (best.Phosphorus / 100) * food.WeightGrams

		totalK += k
		totalP += p

		breakdown = append(breakdown, gin.H{
			"ingredientName": food.IngredientName,
			"weightGrams":    food.WeightGrams,
			"potassium":      math.Round(k),
			"phosphorus":     math.Round(p),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"breakdown": breakdown,
		"totals": gin.H{
			"potassium":  math.Round(totalK),
			"phosphorus": math.Round(totalP),
		},
	})
}

// Handler for GET /dashboard/search-food
func (a *App) SearchFood(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing query"})
		return
	}

	results, err := repositories.FnddsQuery(a.DBPool, query)
	if err != nil || results == nil || len(*results) == 0 {
		c.JSON(http.StatusOK, gin.H{"results": []models.FnddsFoodItem{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": *results})
}

// Handler for GET /dashboard/autocomplete
func (a *App) AutocompleteSuggestions(c *gin.Context) {
	prefix := c.Query("q")
	if len(prefix) < 2 {
		c.JSON(http.StatusOK, gin.H{"suggestions": []string{}})
		return
	}

	// Use a simpler LIKE query here (or ilike for case-insensitivity)
	rows, err := a.DBPool.Query(context.Background(), `
		SELECT DISTINCT description FROM fndds_nutrient_values
		WHERE description ILIKE $1
		LIMIT 10;
	`, prefix+"%")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}
	defer rows.Close()

	var suggestions []string
	for rows.Next() {
		var desc string
		rows.Scan(&desc)
		suggestions = append(suggestions, desc)
	}

	c.JSON(http.StatusOK, gin.H{"suggestions": suggestions})
}
