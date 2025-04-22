// testdb.go
//
// ✅ What This Does
// - Provides a shared SetupTestDB(t) function for backend DB tests
// - Connects to PostgreSQL using pgxpool
// - Aborts test on failed connection
//
// 🧪 What’s Covered
// ✅ Connection pooling via pgx
// ✅ Logs or fails fast if DB is unreachable
//
// 🧪 What’s NOT Covered
// ❌ Table creation (assumes schema already loaded via migration or .sql)
// ❌ Data cleanup/reset (you can truncate if needed)

package testdb

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupTestDB(t *testing.T) *pgxpool.Pool {
	t.Helper()

	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:password@localhost:5433/kayphos_test?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("❌ Failed to connect to test DB: %v", err)
	}

	err = pool.Ping(ctx)
	if err != nil {
		t.Fatalf("❌ Ping failed for test DB: %v", err)
	}

	fmt.Println("✅ Connected to test DB")
	return pool
}
