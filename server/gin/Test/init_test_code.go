package test

import (
	"log"
	"os"
	"testing"
)

// init_test.go is run before any other tests in this package

func TestMain(m *testing.M) {
	log.Println("🔬 Starting unit tests...")

	// Optional: set default test DB URL if not set
	if os.Getenv("TEST_DATABASE_URL") == "" {
		os.Setenv("TEST_DATABASE_URL", "postgres://postgres:password@localhost:5432/kayphos?sslmode=disable")
	}

	// Run all tests
	code := m.Run()

	log.Println("✅ Tests completed.")
	os.Exit(code)
}
