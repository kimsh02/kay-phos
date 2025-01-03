package models

/*
 * User is the model for users of kayphos, a User can be created, updated,
 * deleted, or retreived from the database
 */

type User struct {
	FirstName      string `json:"firstname"`
	LastName       string `json:"lastname"`
	NickName       string `json:"nickname"`
	UserName       string `json:"username"`
	UserID         string `json:"userid"`
	HashedPassword string `json:"hashedpassword"`
	Salt           string `json:"salt"`
}
