package repo_tests

import (
	"testing"

	"github.com/kimsh02/kay-phos/server/gin/internal/repositories"
	"github.com/stretchr/testify/assert"
)

func TestFnddsQuery(t *testing.T) {
	db := GetTestDB()
	results, err := repositories.FnddsQuery(db, "banana")
	assert.NoError(t, err)
	assert.NotNil(t, results)
}
