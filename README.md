# Wedding website

Wedding website put together because the venue was sure that it would not be possible for
them to take on the reservation of rooms for our guests

## populate rooms
mongoimport --uri <mongo_uri> --jsonArray db/room.json

## deploy to AWS

docker build -t izzyandwill .
docker tag izzyandwill <account_no>.dkr.ecr.eu-west-2.amazonaws.com/izzyandwill
$(aws ecr get-login --no-include-email)
docker push 