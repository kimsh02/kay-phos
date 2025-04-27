package testutils

import (
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
	"github.com/stretchr/testify/mock"
)

type MockFnddsRepo struct {
	mock.Mock
}

func (m *MockFnddsRepo) FnddsQuery(db repositories.DBClient, ingredientName string) (*[]models.FnddsFoodItem, error) {
	args := m.Called(db, ingredientName)
	return args.Get(0).(*[]models.FnddsFoodItem), args.Error(1)
}
