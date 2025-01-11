#!/bin/bash

# user_endpoints=("http://localhost:8080/api/login" "http://localhost:8080/api/new-account")
new_account="http://localhost:8080/api/new-account"
login="http://localhost:8080/api/login"
iterations=100

# Test users

# Insert new users
for ((i = 0; i < iterations; i++)); do
    echo "Inserting user js$i."
    curl "$new_account" --request "POST" --data "{\"firstname\": \"Joseph\",\"lastname\": \"Smith\",\"username\": \"js$i\",\"inputpassword\": \"p$i\"}"
done
# Insert new users again
for ((i = 0; i < iterations; i++)); do
    echo "Inserting user js$i again."
    curl "$new_account" --request "POST" --data "{\"firstname\": \"Joseph\",\"lastname\": \"Smith\",\"username\": \"js$i\",\"inputpassword\": \"p$i\"}"
done
# Login users with correct username and password
for ((i = 0; i < iterations; i++)); do
    echo "User js$i login with correct username and password."
    curl "$login" --request "GET" --data "{\"username\": \"js$i\",\"inputpassword\": \"p$i\"}"
done
# Login users with non-existent username
for ((i = 0; i < iterations; i++)); do
    echo "User js$i login with non-existent username."
    curl "$login" --request "GET" --data "{\"username\": \"tk$i\",\"inputpassword\": \"p$i\"}"
done
# Login users with incorrect password
for ((i = 0; i < iterations; i++)); do
    echo "User js$i login with incorrect password."
    curl "$login" --request "GET" --data "{\"username\": \"js$i\",\"inputpassword\": \"p\"}"
done


# curl "http://localhost:8080/api/new-account" --request "POST" --data '{"firstname": "Shawn","lastname": "Kim","username": "tkim5","inputpassword": "any"}'

# curl "http://localhost:8080/api/login" --request "GET" --data '{"username": "tkim5","inputpassword": "any"}'
