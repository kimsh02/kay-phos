// fndds_handler_test.go
//
// ✅ What This Tests
// - Tests the /dashboard/api/calculate-intake endpoint
// - Verifies JSON response structure based on mocked DB results
// - Uses a real test DB (PostgreSQL via Docker)
//
// 🧪 Type of Test
// - backend + Database integration test
//
// 🧪 What’s Covered in This Pattern
// ✅ Handler setup
// ✅ Mock DB with sample data
// ✅ HTTP request to Gin router
// ✅ JSON decoding and assertion
//
// 🧪 What’s NOT Covered
// ❌ Token middleware (assumes token bypassed or already valid)
// ❌ Full dataset from FNDDS — just uses inserts to test flow
// ❌ Frontend logic

package backend

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/kimsh02/kay-phos/server/gin/test/backend/testdb"
	"github.com/stretchr/testify/assert"
)

func TestCalculateIntake(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// ✅ Setup DB and insert mock data
	pool := testdb.SetupTestDB(t)
	ctx := context.Background()

	_, err := pool.Exec(ctx, `
		INSERT INTO fndds_nutrient_values 
			("Food code", description, "Potassium (mg)", "Phosphorus (mg)")
		VALUES 
			(12345678, 'banana mashed raw', 358, 22)
	`)
	assert.NoError(t, err)

	app := handlers.App{DBPool: pool}
	router := gin.Default()
	router.POST("/dashboard/api/calculate-intake", app.CalculateIntake)

	// ✅ Construct JSON body for POST
	payload := map[string]interface{}{
		"foodNames": []string{"banana mashed raw"},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "/dashboard/api/calculate-intake", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// ✅ Parse response
	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	// ✅ Check total nutrients returned
	assert.Contains(t, response, "totalPotassium")
	assert.Contains(t, response, "totalPhosphorus")
	assert.Greater(t, response["totalPotassium"].(float64), 0.0)
	assert.Greater(t, response["totalPhosphorus"].(float64), 0.0)
}
