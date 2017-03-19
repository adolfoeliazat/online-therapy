# Online Therapy App
- Basic web app provides real-time chatting between multiple people who are in the same channel
- In future, it will be between Therapist and client in a private room and there will be an matching process

# Setup dev Environment
- provision new vagrant instance (vagrant & virtual box) with ubuntu/xenial64 box.
- update the ubuntu -> sudo apt-get update
- install nodeJs (instructions from https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
  - curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  - sudo apt-get install -y nodejs
- install project packages. run the command on main folder where package.json exists   -> npm install
- we need to install redis for socket.io for pub/sub (instructions from https://redis.io/topics/quickstart)
  - sudo apt-get install build-essential tcl
  - cd
  - wget http://download.redis.io/redis-stable.tar.gz
  - tar xvzf redis-stable.tar.gz
  - make
  - sudo make install
  - make test (to see everything is working)
  - run redis server -> redis-server (run this in different tab or follow the instruction on the link above to setup properly with init script)
  - redis-cli ping --> will print PONG
- go to main project folder
- start the app -> npm start
- or install pm2 to run the application in background
  - sudo npm install pm2@latest -g
  - PORT=8080 pm2 start bin/www --name "online-therapy"
- default port is 3000
- open it in browser your_local_private_ip:port ex. 192.168.77.77:3000
