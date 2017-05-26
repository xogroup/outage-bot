FROM node:boron-slim

MAINTAINER Matt Phillips

# Port 3000 for server
EXPOSE 3000
EXPOSE 5858

ENTRYPOINT ["docker-shell"]

CMD ["-r"]

RUN npm i -g pm2

ADD ./docker/docker-shell.sh /usr/bin/docker-shell
RUN chmod +x /usr/bin/docker-shell

ADD ./package.json $APPDIR/package.json
ADD ./npm-shrinkwrap.json $APPDIR/npm-shrinkwrap.json

RUN npm install

ADD . $APPDIR