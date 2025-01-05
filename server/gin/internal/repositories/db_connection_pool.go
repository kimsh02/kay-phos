package repositories

import (
	"context"
	"errors"
	"log"
	"os/exec"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

/*
 * returns db connection pool to postgres
 */

func getDBUser() string {
	// Get name of user on machine
	cmd := exec.Command("whoami")
	output, _ := cmd.Output()
	return strings.TrimSpace(string(output))
}

func NewDBConnectionPool() (*pgxpool.Pool, error) {
	// Set connection string
	dbURL := "postgres://" + getDBUser() + "@localhost/kayphos"

	// Define custom pool configuration
	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, err
	}
	config.MaxConns = 50
	// prepare fndds statement
	// TODO: ts_rank?
	config.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		_, err := conn.Prepare(ctx, "fndds_search_query", "select \"Main food description\", \"Phosphorus (mg)\", \"Potassium (mg)\" from fndds_nutrient_values where description @@ to_tsquery('english', $1);")
		if err != nil {
			log.Println(err)
		}
		return err
	}

	// Create DB pool
	dbPool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, errors.New("DB connection failed.")
	}
	return dbPool, nil
}
