package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/stretchr/testify/assert"
)

func TestInsertMealHistory(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	body := map[string]interface{}{
		"entries": []map[string]interface{}{
			{"foodCode": 1001, "time": time.Now()},
		},
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/dashboard/user-meal-history", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	app.InsertMealHistory(c)
	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestGetMealHistory(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	req := httptest.NewRequest(http.MethodGet, "/dashboard/api/user-meal-history", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	app.GetMealHistory(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestDeleteMealEntry(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	body := map[string]interface{}{"foodCode": 1001}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodDelete, "/dashboard/user-meal-history", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	app.DeleteMealEntry(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetFoodCode(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	req := httptest.NewRequest(http.MethodGet, "/dashboard/foodcode?name=banana", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Request.URL.RawQuery = "name=banana"
	app.GetFoodCode(c)
	assert.Equal(t, http.StatusOK, w.Code)
}
