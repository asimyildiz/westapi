# Backend system for VIP car rental

# Technology
- Javascript (Typescript)
- node.js with express
- MongoDB with mongoose (MongoDB Atlas)
- Google Maps api for querying places api, get route between two places, calculate distances
- Turf api for checking special points (bridges etc.) on a route
- Docker to run services on AWS ECS (Docker image is being pushed into AWS ECR)

# On Windows Machine :
- docker volume create --name=westapidata (Only for first time)
- docker-compose up
- npm install
- npm run start

# Problems :
- if there is an error with docker-compose up, run
- docker-compose down --remove-orphans
- then restart docker desktop app
