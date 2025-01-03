package models

import "time"

/*
 * Meal is the model for meals that a user records in kayphos, a Meal can be
 * created, updated, or retrieved from the database
 */

type Meal struct {
	UserID      string    `json:"userid"`
	Description string    `json:"description"`
	Potassium   float64   `json:"potassium"`
	Phosphorus  float64   `json:"phosphorus"`
	Time        time.Time `json:"time"`
}
