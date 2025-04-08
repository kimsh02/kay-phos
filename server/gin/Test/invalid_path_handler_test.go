package test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/stretchr/testify/assert"
)

func TestInvalidPathHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.NoRoute(handlers.InvalidPath)

	req := httptest.NewRequest("GET", "/invalid/route", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
