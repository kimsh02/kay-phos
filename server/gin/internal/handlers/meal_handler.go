package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
)

type mealEntryRequest struct {
	FoodCode int       `json:"foodCode"`
	Time     time.Time `json:"time"`
}

type mealInsertRequest struct {
	Entries []mealEntryRequest `json:"entries"`
}

// POST /dashboard/user-meal-history
func (app *App) InsertMealHistory(c *gin.Context) {
	// Extract user ID from JWT
	claims := c.MustGet("claims").(*models.Claims)
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user token"})
		return
	}

	var request mealInsertRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	for _, entry := range request.Entries {
		if err := repositories.InsertMeal(app.DBPool, userID, entry.FoodCode, entry.Time); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert meal"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Meal history updated"})
}

// GET /dashboard/foodcode?name=Banana
func (app *App) GetFoodCode(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing food name"})
		return
	}

	results, err := repositories.FnddsQuery(app.DBPool, name)
	if err != nil || results == nil || len(*results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"foodCode":    (*results)[0].FoodCode,
		"description": (*results)[0].Description,
	})
}

// GET /dashboard/api/user-meal-history
func (app *App) GetMealHistory(c *gin.Context) {
	log.Println("🔍 GetMealHistory called...")

	claimsRaw, exists := c.Get("claims")
	if !exists {
		log.Println("❌ No claims found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	claims, ok := claimsRaw.(*models.Claims)
	if !ok {
		log.Printf("❌ Claims type mismatch: %#v\n", claimsRaw)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid token claims"})
		return
	}

	log.Println("✅ Claims extracted:", claims.UserID)

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		log.Println("❌ UUID parse error:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	meals, err := repositories.GetMealsByUserID(app.DBPool, userID)
	if err != nil {
		log.Println("❌ Failed to fetch meals from DB:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch meals"})
		return
	}

	log.Printf("✅ Returning %d meals\n", len(meals))
	c.JSON(http.StatusOK, meals)
}

// DELETE /dashboard/user-meal-history
func (app *App) DeleteMealEntry(c *gin.Context) {
	claims := c.MustGet("claims").(*models.Claims)
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user token"})
		return
	}

	var req struct {
		FoodCode int `json:"foodCode"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	log.Printf("🧹 Received delete request: user=%s foodCode=%d\n", userID, req.FoodCode)
	err = repositories.DeleteMeal(app.DBPool, userID, req.FoodCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete meal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Meal deleted"})
}
