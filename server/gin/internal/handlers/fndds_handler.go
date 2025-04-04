package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
)

/*
 * handler for fnnds_food_item
 */

// builds ts query from string
func tsQuery(query string) string {
	runes := []rune(query)
	for i := range runes {
		if runes[i] == '+' {
			runes[i] = '&'
		}
	}
	return string(runes)
}

func (app *App) SearchFnddsFoodItems(c *gin.Context) {
	var body struct {
		FoodName string `json:"food_name"`
	}

	if err := c.ShouldBindJSON(&body); err != nil || body.FoodName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid food_name"})
		return
	}

	query := tsQuery(body.FoodName)

	foodItems, err := repositories.FnddsQuery(app.DBPool, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(*foodItems) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No matching food found"})
		return
	}

	c.JSON(http.StatusOK, (*foodItems)[0]) // returns first match
}
