package repositories

import (
	"context"
	"errors"
	"os/exec"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

func New_DB_Connection_Pool() (*pgxpool.Pool, error) {
	cmd := exec.Command("whoami")
	output, err := cmd.Output()
	if err != nil {
		return nil, errors.New("DB connection failed.")
	}
	username := strings.TrimSpace(string(output))
	dbURL := "postgres://" + username + "@localhost/kayphos"
	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return nil, errors.New("DB connection failed.")
	}
	return dbPool, nil
}
