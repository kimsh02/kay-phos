CREATE TABLE users (
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    user_name       VARCHAR(100) UNIQUE NOT NULL,
    user_id 	    UUID UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
);
