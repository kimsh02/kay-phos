DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop over all tables in the public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || r.tablename || ' CASCADE';
    END LOOP;
END $$;

CREATE TABLE foundation_food (
    fdc_id int primary key,
    ndb_number int,
    footnote text
);

copy foundation_food
from '/Users/kimsh/Downloads/course/fall24/engr498a/kay-phos/database-config/foods/FoodData_Central_foundation_food_csv_2024-10-31/foundation_food.csv'
delimiter ','
csv header;

CREATE TABLE food (
    fdc_id int primary key,
    data_type text,
    description text,
    food_category_id text,
    publication_date date
);

copy food
from '/Users/kimsh/Downloads/course/fall24/engr498a/kay-phos/database-config/foods/FoodData_Central_foundation_food_csv_2024-10-31/food.csv'
delimiter ','
csv header;

CREATE TABLE nutrient (
    id smallint primary key,
    name text,
    unit_name text,
    nutrient_nbr text,
    rank text
);

copy nutrient
from '/Users/kimsh/Downloads/course/fall24/engr498a/kay-phos/database-config/foods/FoodData_Central_foundation_food_csv_2024-10-31/nutrient.csv'
delimiter ','
csv header;

CREATE TABLE food_nutrient (
    id int primary key,
    fdc_id int,
    nutrient_id int,
    amount text,
    t1 text,
    t2 text,
    t3 text,
    t4 text,
    t5 text,
    t6 text,
    t7 text
);

copy food_nutrient
from '/Users/kimsh/Downloads/course/fall24/engr498a/kay-phos/database-config/foods/FoodData_Central_foundation_food_csv_2024-10-31/food_nutrient.csv'
delimiter ','
csv header;

CREATE TABLE food_portion (
    id int primary key,
    fdc_id int,
    t1 text,
    t2 text,
    t3 text,
    t4 text,
    t5 text,
    gram_weight double precision,
    t6 text,
    t7 text,
    t8 text
);

copy food_portion
from '/Users/kimsh/Downloads/course/fall24/engr498a/kay-phos/database-config/foods/FoodData_Central_foundation_food_csv_2024-10-31/food_portion.csv'
delimiter ','
csv header;

create table foundation_food_items
as select
foundation_food.fdc_id,
food.description
-- food_portion.gram_weight
-- nutrient.name,
-- food_nutrient.amount
-- nutrient.unit_name
from
foundation_food join food on foundation_food.fdc_id = food.fdc_id;
-- join food_portion on foundation_food.fdc_id = food_portion.fdc_id;
-- foundation_food join food_portion on foundation_food.fdc_id = food_portion.fdc_id;

-- join food_nutrient on foundation_food.fdc_id = food_nutrient.fdc_id and
-- food_nutrient.nutrient_id in (1092,1091);
-- join nutrient on food_nutrient.nutrient_id = nutrient.id where nutrient_id in (1091,1092);

alter table foundation_food_items add column K text;

update foundation_food_items
set K = food_nutrient.amount
from food_nutrient where foundation_food_items.fdc_id = food_nutrient.fdc_id and
food_nutrient.nutrient_id = 1092;
