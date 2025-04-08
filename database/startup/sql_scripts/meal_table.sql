CREATE TABLE IF NOT EXISTS meals (
    user_id UUID NOT NULL,
    food_code INTEGER NOT NULL,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, food_code, time),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_code) REFERENCES fndds_nutrient_values(food_code) ON DELETE CASCADE
    );

-- B+ Tree index on user_id for fast meal lookups by user
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
