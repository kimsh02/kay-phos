package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
)

/*
 * handler for fnnds_food_item
 */

func (app *App) SearchFnddsFoodItems(c *gin.Context) {
	query := c.Param("query")
	food_items, err := repositories.FnddsQuery(app.DBPool, query)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "bad request"})
	}
	for _, v := range food_items {
		c.IndentedJSON(http.StatusOK, v)
	}
}
