package repo_tests

import (
	"context"
	"log"
	"os"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	testDBPool *pgxpool.Pool
	once       sync.Once
)

// GetTestDB returns a shared test DB pool (singleton-style for efficiency)
func GetTestDB() *pgxpool.Pool {
	once.Do(func() {
		dsn := os.Getenv("TEST_DATABASE_URL")
		if dsn == "" {
			// fallback or local default for test environment
			dsn = "postgres://postgres:password@localhost:5432/kayphos?sslmode=disable"
		}
		var err error
		testDBPool, err = pgxpool.New(context.Background(), dsn)
		if err != nil {
			log.Fatalf("Failed to connect to test database: %v", err)
		}
	})
	return testDBPool
}
