package test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/stretchr/testify/assert"
)

func TestPageRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.Default()

	routes := map[string]gin.HandlerFunc{
		"/login":              handlers.LoginPage,
		"/new-account":        handlers.NewAccountPage,
		"/dashboard":          handlers.DashboardPage,
		"/manual-food-search": handlers.ManualFoodSearchPage,
		"/ai-food-search":     handlers.AIFoodSearchPage,
		"/user-define-meal":   handlers.UserDefineMealPage,
		"/user-meal-history":  handlers.UserMealHistoryPage,
	}

	for route, handler := range routes {
		router.GET(route, handler)
		req := httptest.NewRequest(http.MethodGet, route, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code, "Route %s should return 200", route)
	}
}
