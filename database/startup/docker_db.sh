#!/bin/zsh

# make fndds_data directory
mkdir -p fndds_data

PGHOST="db"
PGUSER="postgres"
PGPASSWORD="password"

# drop kayphos database
dropdb --if-exists $PGDATABASE -U postgres

# create kayphos database
createdb $PGDATABASE -U postgres

# download food item dataset
if [ ! -f "fndds_data/fndds_data/2021-2023.xlsx" ]; then
   curl -o "fndds_data/2021-2023.xlsx" "https://www.ars.usda.gov/ARSUserFiles/80400530/apps/2021-2023%20FNDDS%20At%20A%20Glance%20-%20FNDDS%20Nutrient%20Values.xlsx"
fi

# convert xlsx to csv
if [ ! -f "fndds_data\fndds_nutrient_values.csv " ]; then
    xlsx2csv fndds_data/2021-2023%20FNDDS%20At%20A%20Glance%20-%20FNDDS%20Nutrient%20Values.xlsx fndds_data/fndds_nutrient_values.csv
fi

# remove title lines from csv file
sed -i '1,2d' fndds_data/fndds_nutrient_values.csv

# drop all relations in db
# psql -d kayphos -f sql_scripts/drop.sql

# import csv to postgres
# TODO: CHANGE STRING TO YOUR POSTGRES DB
# USER=$(whoami)
csvsql --insert --db "postgresql://postgres:localhost@localhost:5432/kayphos" fndds_data/fndds_nutrient_values.csv

# create new column with GIN index on "Main food description" column
psql -d kayphos -U postgres -f sql_scripts/gin_index.sql

# create trigram index on "Main food description" column
psql -d kayphos -U postgres -f sql_scripts/trigram_index.sql

# enforce unique on food code column of fndds
psql -d kayphos -U postgres -f sql_scripts/unique_food_code.sql

# create user table
psql -d kayphos -U postgres -f sql_scripts/user_table.sql

# create meal table
psql -d kayphos -U postgres -f sql_scripts/meal_table.sql

# create user sessions table
psql -d kayphos -U postgres -f sql_scripts/user_sessions.sql
