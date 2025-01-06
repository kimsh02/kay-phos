package repositories

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kimsh02/kay-phos/server/gin/internal/models"
)

/*
 * User repository interacts with users table in postgres
 */

// checks if username exists in users table
func CheckUserNameExists(dbPool *pgxpool.Pool, username *string) bool {
	var exists bool
	row := dbPool.QueryRow(context.Background(), "unique_username_query", username)
	if err := row.Scan(&exists); err != nil {
		log.Println("Error scanning username.")
		log.Println(err)
	}
	return exists
}

// create user in users table
func CreateUser(dbPool *pgxpool.Pool, user *models.User) error {
	// Insert user into db
	_, err := dbPool.Exec(context.Background(), "user_insert_query", user.FirstName, user.LastName, user.UserName, user.UserID, user.HashedPassword)
	if err != nil {
		log.Println("Error inserting user into database.")
		log.Println(err)
		return err
	}
	return nil
}
