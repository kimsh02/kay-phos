package models

import (
	"log"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

/*
 * User is the model for users of kayphos, a User can be created, updated,
 * deleted, or retreived from the database
 */

type User struct {
	FirstName      string    `json:"firstname"`
	LastName       string    `json:"lastname"`
	UserName       string    `json:"username"`
	UserID         uuid.UUID `json:"userid"`
	HashedPassword string    `json:"hashedpassword"`
}

// set user id for a newly created User
func (user *User) SetUserID() {
	user.UserID = uuid.New()
}

// Sets hashed password for a newly created User given a password
func (user *User) SetHashedPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Println(err)
		return err
	}
	user.HashedPassword = string(hashedPassword)
	return nil
}

// Checks hashed password to the given password
func (user *User) CheckPassword(password string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(password)); err != nil {
		log.Println(err)
		return err
	}
	return nil
}
