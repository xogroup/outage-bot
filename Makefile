VERSION=$$(git rev-parse --short HEAD)
NODE_ENV=qa
OSTYPE := $(shell uname)

clean:
	@rm -f npm-shrinkwrap.json
	@rm -rf ./node_modules
	npm install --production
	shonkwrap

install:
	@rm -rf ./node_modules
	npm install

docker-clean:
	@echo "Removing images"
ifeq ($(OSTYPE),Darwin)
	docker ps -aq | xargs docker rm -f
	docker images -f "dangling=true" -q | xargs docker rmi
else
	docker ps -aq | xargs -r docker rm -f
	docker images -f "dangling=true" -q | xargs -r docker rmi
endif

lint:
	node_modules/.bin/eslint --fix src/ test/

.PHONY: clean install docker-build docker-run jenkins-build jenkins-push jenkins-clean aws-build lint docker-clean