CREATE TABLE users (
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    nick_name       VARCHAR(100),
    user_name       VARCHAR(100) UNIQUE NOT NULL,
    user_id         VARCHAR(100) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    salt            TEXT NOT NULL
);
