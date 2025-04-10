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
	claims := c.MustGet("claims").(*models.Claims)
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user token"})
		return
	}

	// Attempt to decode as grouped meal
	var grouped models.MealGroup
	if err := c.ShouldBindJSON(&grouped); err == nil && grouped.MealName != "" && len(grouped.Ingredients) > 0 {
		for _, ing := range grouped.Ingredients {
			if err := repositories.InsertCustomMeal(app.DBPool, userID, grouped.MealName, grouped.Time, ing); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert custom meal"})
				return
			}
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Grouped meal saved successfully"})
		return
	}

	// Fallback: handle legacy { entries: [{foodCode, time}] }
	var legacy struct {
		Entries []struct {
			FoodCode int       `json:"foodCode"`
			Time     time.Time `json:"time"`
		} `json:"entries"`
	}
	if err := c.ShouldBindJSON(&legacy); err == nil && len(legacy.Entries) > 0 {
		for _, entry := range legacy.Entries {
			if err := repositories.InsertMeal(app.DBPool, userID, entry.FoodCode, entry.Time); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert legacy meal entry"})
				return
			}
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Legacy meals saved successfully"})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meal format"})
}

// GET /dashboard/foodcode?name=Banana
func (a *App) GetFoodCode(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing food name"})
		return
	}

	results, err := repositories.FnddsQuery(a.DBPool, name)
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
func (a *App) GetMealHistory(c *gin.Context) {
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

	meals, err := repositories.GetMealsByUserID(a.DBPool, userID)
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
		MealName string `json:"mealName"`
	}

	if err := c.ShouldBindJSON(&req); err != nil || req.MealName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing meal name"})
		return
	}

	log.Printf("🧹 Deleting meal for user %s: mealName=%s\n", userID, req.MealName)

	err = repositories.DeleteMealByName(app.DBPool, userID, req.MealName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete meal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Meal deleted"})
}
