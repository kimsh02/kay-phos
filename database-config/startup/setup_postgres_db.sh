#!/bin/zsh

# install python helper tools
pip install xlsx2csv csvkit

# delete all xlsx files in directory
rm -rf *.xlsx

# delete all csv files in directory
rm -rf *.csv

# download food item dataset
curl -O https://www.ars.usda.gov/ARSUserFiles/80400530/apps/2021-2023%20FNDDS%20At%20A%20Glance%20-%20FNDDS%20Nutrient%20Values.xlsx

# convert xlsx to csv
xlsx2csv 2021-2023%20FNDDS%20At%20A%20Glance%20-%20FNDDS%20Nutrient%20Values.xlsx fndds_nutrient_values.csv

# remove title lines from csv file
sed -i '' '1,2d' fndds_nutrient_values.csv

# drop all relations in db
psql -d kayphos -f drop.sql

# import csv to postgres
# TODO: CHANGE STRING TO YOUR POSTGRES DB
csvsql --insert --db "postgresql://kimsh@localhost/kayphos" fndds_nutrient_values.csv

# create new column with GIN index on "Main food description" column
psql -d kayphos -f gin_index.sql

# create trigram index on "Main food description" column
psql -d kayphos -f trigram_index.sql
