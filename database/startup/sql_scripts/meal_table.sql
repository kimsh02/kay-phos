CREATE TABLE meals (
    user_id      UUID NOT NULL,
    food_code 	 NUMERIC NOT NULL,
    time         TIMESTAMP NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id), -- Assuming `users` table exists
    CONSTRAINT fk_food FOREIGN KEY (food_code) REFERENCES fndds_nutrient_values("Food code")
);

CREATE INDEX idx_user_id ON meals (user_id);
