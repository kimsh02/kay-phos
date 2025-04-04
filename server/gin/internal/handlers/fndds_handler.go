package handlers

import (
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
)

// Handler for POST /dashboard/calculate-intake
func (app *App) CalculateIntake(c *gin.Context) {
	var body struct {
		SelectedFoods []struct {
			IngredientName string  `json:"ingredientName"`
			WeightGrams    float64 `json:"weightGrams"`
		} `json:"selectedFoods"`
	}

	if err := c.ShouldBindJSON(&body); err != nil || len(body.SelectedFoods) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or empty selectedFoods"})
		return
	}

	var totalPotassium float64
	var totalPhosphorus float64

	for _, food := range body.SelectedFoods {
		results, err := repositories.FnddsQuery(app.DBPool, food.IngredientName)
		if err != nil || results == nil || len(*results) == 0 {
			continue // Skip unmatched foods
		}

		match := (*results)[0]            // Use best match
		ratio := food.WeightGrams / 100.0 // USDA data is per 100g

		totalPotassium += match.Potassium * ratio
		totalPhosphorus += match.Phosphorus * ratio
	}

	c.JSON(http.StatusOK, gin.H{
		"potassium":  roundFloat(totalPotassium, 1),
		"phosphorus": roundFloat(totalPhosphorus, 1),
	})
}

// Utility to round float values
func roundFloat(val float64, precision int) float64 {
	p := math.Pow(10, float64(precision))
	return math.Round(val*p) / p
}
