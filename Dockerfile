FROM ubuntu:latest

WORKDIR /usr/app/src

RUN apt update && apt upgrade &&\
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

COPY . .

CMD [ "npm", "i", "&&", "npm", "build", "&&", "npm", "start"]