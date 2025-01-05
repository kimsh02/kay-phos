package handlers

import "github.com/jackc/pgx/v5/pgxpool"

/*
 * dependency injection for handlers using dbpool
 */

type App struct {
	DBPool *pgxpool.Pool
}
