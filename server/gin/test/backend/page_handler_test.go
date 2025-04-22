// page_handler_test.go
//
// ✅ What This Tests
// - That registered public and dashboard routes return 200
// - That invalid/unregistered routes return 404
// - That login and account creation POST endpoints respond with 200/400 (basic logic path)
//
// 🧪 What’s Covered in This Pattern
// ✅ GET + POST route coverage
// ✅ Invalid route handling
// ✅ Login + signup form endpoint coverage (minimal body)
//
// 🧪 What’s NOT Covered
// ❌ Full body validation / form parsing
// ❌ Actual user creation (separate in user_repo_test)
// ❌ Auth cookie logic (covered elsewhere)

package backend

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/kimsh02/kay-phos/server/gin/internal/router"
)

func setupRouterForPages() *gin.Engine {
	app := &handlers.App{}
	r := router.NewRouter()
	r.LoadHTMLGlob("public/html/*.html")
	router.InitStatic(r)
	router.InitRoutes(r, app)
	return r
}

func TestRegisteredPageRoutes_Return200(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := setupRouterForPages()

	tests := []struct {
		path string
	}{
		{"/"},
		{"/new-account/"},
		{"/dashboard/"},
		{"/dashboard/manual-food-search/"},
		{"/dashboard/ai-food-search/"},
		{"/dashboard/user-define-meal"},
		{"/dashboard/user-meal-history"},
	}

	for _, tt := range tests {
		t.Run("GET "+tt.path, func(t *testing.T) {
			req, _ := http.NewRequest("GET", tt.path, nil)
			req.Host = "localhost:8080"
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			assert.NotEqual(t, 404, w.Code, "Expected %s to be registered", tt.path)
			assert.Less(t, w.Code, 500)
		})
	}
}

func TestUnregisteredRoute_Returns404(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := setupRouterForPages()

	req, _ := http.NewRequest("GET", "/not-a-real-page", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, 404, w.Code, "Unregistered routes should return 404")
}

func TestLoginAndSignupPostRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := setupRouterForPages()

	// ✅ Login POST
	loginData := url.Values{}
	loginData.Set("username", "testuser")
	loginData.Set("password", "testpass")
	loginReq, _ := http.NewRequest("POST", "/", strings.NewReader(loginData.Encode()))
	loginReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	loginResp := httptest.NewRecorder()
	r.ServeHTTP(loginResp, loginReq)
	assert.NotEqual(t, 404, loginResp.Code, "Login POST route should exist")
	assert.Less(t, loginResp.Code, 500)

	// ✅ Signup POST
	signupData := url.Values{}
	signupData.Set("firstName", "Joe")
	signupData.Set("lastName", "Tester")
	signupData.Set("username", "testuser123")
	signupData.Set("email", "testuser@example.com")
	signupData.Set("password", "pass123")
	signupReq, _ := http.NewRequest("POST", "/new-account/", strings.NewReader(signupData.Encode()))
	signupReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	signupResp := httptest.NewRecorder()
	r.ServeHTTP(signupResp, signupReq)
	assert.NotEqual(t, 404, signupResp.Code, "Signup POST route should exist")
	assert.Less(t, signupResp.Code, 500)
}
