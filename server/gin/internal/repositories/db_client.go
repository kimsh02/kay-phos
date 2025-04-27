package repositories

import (
	"context"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type DBClient interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

type FnddsRepo interface {
	FnddsQuery(db DBClient, ingredientName string) (*[]models.FnddsFoodItem, error)
}
