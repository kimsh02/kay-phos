package repositories

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

/*
 * returns db connection pool to postgres
 */

// func getDBUser() string {
// 	// Get name of user on machine
// 	cmd := exec.Command("whoami")
// 	output, _ := cmd.Output()
// 	return strings.TrimSpace(string(output))
// }

func prepareSQLStatements(config *pgxpool.Config) {
	// TODO: ts_rank
	config.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		// Prepare fndds search query
		_, err := conn.Prepare(ctx, "fndds_search_query", "select \"Food code\", \"Main food description\", \"Phosphorus (mg)\", \"Potassium (mg)\" from fndds_nutrient_values where description @@ to_tsquery('english', $1);")
		if err != nil {
			log.Println("Prepared statement error.")
			log.Println(err)
			return err
		}
		// Prepare unique username query
		_, err = conn.Prepare(ctx, "unique_username_query", "select exists(select 1 from users where users.user_name = $1);")
		if err != nil {
			log.Println("Prepared statement error.")
			log.Println(err)
			return err
		}
		// Prepare user insert query
		_, err = conn.Prepare(ctx, "user_insert_query", "insert into users (first_name, last_name, user_name, user_id, hashed_password) values ($1, $2, $3, $4, $5)")
		if err != nil {
			log.Println("Prepared statement error.")
			log.Println(err)
			return err
		}
		// Prepare user select query
		_, err = conn.Prepare(ctx, "user_select_query", "select first_name, last_name, user_id, hashed_password from users where users.user_name = $1;")
		if err != nil {
			log.Println("Prepared statement error.")
			log.Println(err)
			return err
		}
		return nil
	}
}

func NewDBConnectionPool() (*pgxpool.Pool, error) {
	// Set connection string
	// dbURL := "postgres://" + getDBUser() + "@localhost/kayphos"
	dbURL := os.Getenv("DB_CONNECTION_STR")

	// Define custom pool configuration
	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, err
	}
	config.MaxConns = 50

	// Prepare SQL statements
	prepareSQLStatements(config)

	// Create DB pool
	dbPool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, errors.New("DB connection failed.")
	}
	return dbPool, nil
}
