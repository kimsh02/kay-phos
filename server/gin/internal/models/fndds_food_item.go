package models

/*
 * Fndds_Food_Item is the food item model for the FNDDS foods from usda.gov, a
 * Fndds_Food_Item can only be retrieved from the database
 */

type FnddsFoodItem struct {
	Description string  `json:"description"`
	Potassium   float64 `json:"potassium"`
	Phosphorus  float64 `json:"phosphorus"`
}
