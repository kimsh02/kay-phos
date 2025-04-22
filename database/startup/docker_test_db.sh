#!/bin/bash
set -e

echo "🧪 Rebuilding test database: kayphos_test..."

psql -U postgres -c "DROP DATABASE IF EXISTS kayphos_test;"
psql -U postgres -c "CREATE DATABASE kayphos_test;"

# Initialize schema into test DB
psql -U postgres -d kayphos_test -f sql_scripts/user_table.sql
psql -U postgres -d kayphos_test -f sql_scripts/meal_table.sql
psql -U postgres -d kayphos_test -f sql_scripts/user_sessions.sql

# Optional: load FNDDS nutrient data
psql -U postgres -d kayphos_test -f sql_scripts/fndds_nutrient_values.sql

# Indexes
psql -U postgres -d kayphos_test -f sql_scripts/gin_index.sql
psql -U postgres -d kayphos_test -f sql_scripts/trigram_index.sql
psql -U postgres -d kayphos_test -f sql_scripts/unique_food_code.sql

psql -U postgres -d kayphos_test -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

echo "✅ kayphos_test is ready."
