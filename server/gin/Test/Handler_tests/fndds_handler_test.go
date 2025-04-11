package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/stretchr/testify/assert"
)

func TestCalculateIntake(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	body := map[string]interface{}{
		"selectedFoods": []map[string]interface{}{
			{"ingredientName": "Banana", "weightGrams": 100},
		},
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/dashboard/calculate-intake", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	app.CalculateIntake(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestSearchFood(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	req := httptest.NewRequest(http.MethodGet, "/dashboard/search-food?q=banana", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Request.URL.RawQuery = "q=banana"
	app.SearchFood(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAutocompleteSuggestions(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	req := httptest.NewRequest(http.MethodGet, "/dashboard/autocomplete?q=ba", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Request.URL.RawQuery = "q=ba"
	app.AutocompleteSuggestions(c)
	assert.Equal(t, http.StatusOK, w.Code)
}
