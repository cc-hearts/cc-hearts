#! /bin/bash

docker rm -f cc-hearts
docker rmi -f cc-hearts:1.0.0
docker build -t cc-hearts:1.0.0 .

docker run -p 80:80 -v /opt/cc-hearts/dist/:/opt/cc-hearts/ --name cc-hearts -d cc-hearts:1.0.0