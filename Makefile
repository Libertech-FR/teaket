IMGNAME?=ghcr.io/libertech-fr/teaket:latest
APPNAME?=teaket

.DEFAULT_GOAL := help
help:
	@printf "\033[33mUsage:\033[0m\n  make [target] [arg=\"val\"...]\n\n\033[33mTargets:\033[0m\n"
	@grep -E '^[-a-zA-Z0-9_\.\/]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[32m%-15s\033[0m %s\n", $$1, $$2}'

dbs: ## Start databases
	@docker volume create $(APPNAME)-redis
	@docker run -d --rm \
		--name $(APPNAME)-redis \
		--network dev \
		-p 6379:6379 \
		redis
	@docker volume create $(APPNAME)-mongodb
	@docker run -d --rm \
		--name $(APPNAME)-mongodb \
		-v $(APPNAME)-mongodb:/data/db \
		-p 27017:27017 \
		--network dev \
		mongo:5.0 --wiredTigerCacheSizeGB 1.5 --quiet || true

stop-dbs: ## Stop databases
	@docker stop $(APPNAME)-redis || true
	@docker stop $(APPNAME)-mongodb || true

buildseeds: ## Build populate image
	docker build -t seeding -f ./populate/Dockerfile ./populate

populate:
	docker run --rm --network dev -v ./populate:/app seeding populate


