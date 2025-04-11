package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kimsh02/kay-phos/server/gin/internal/handlers"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestLoginUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	user := models.User{UserName: "testuser", InputPassword: "password"}
	jsonBody, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	handlers.MakeUserHandler(app.LoginUser)(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestCreateUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	app := &handlers.App{}
	user := models.User{UserName: "newuser", InputPassword: "newpass"}
	jsonBody, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/new-account/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	handlers.MakeUserHandler(app.CreateUser)(c)
	assert.Equal(t, http.StatusCreated, w.Code)
}
