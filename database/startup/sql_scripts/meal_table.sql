CREATE TABLE IF NOT EXISTS meals (
                                     user_id UUID NOT NULL,
                                     meal_name TEXT NOT NULL,
                                     description TEXT NOT NULL, -- ingredient name
                                     time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     grams FLOAT,
                                     calories FLOAT,
                                     protein FLOAT,
                                     carbs FLOAT,
                                     potassium FLOAT,
                                     Phosphorus FLOAT,
                                     PRIMARY KEY (user_id, meal_name, description, time),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_name_time ON meals(meal_name, time);
