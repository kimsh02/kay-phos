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
	query := c.Param("query")
	// Query Fndds food items
	food_items, err := repositories.FnddsQuery(app.DBPool, tsQuery(query))
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	for _, v := range *food_items {
		c.IndentedJSON(http.StatusOK, v)
	}
}
