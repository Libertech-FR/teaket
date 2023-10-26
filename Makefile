IMGNAME?=ghcr.io/libertech-fr/teaket
APPNAME?=teaket
APP_PORT?=7000
SERVICE_PORT?=7100
MAILREST_PORT?=7200
MAILREST_IMAGE?=ghcr.io/libertech-fr/mailrest
MINIO_ACCESS_KEY?=AKIAIOSFODNN7EXAMPLE
MINIO_SECRET_KEY?=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

.DEFAULT_GOAL := help
help:
	@printf "\033[33mUsage:\033[0m\n  make [target] [arg=\"val\"...]\n\n\033[33mTargets:\033[0m\n"
	@grep -E '^[-a-zA-Z0-9_\.\/]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[32m%-15s\033[0m %s\n", $$1, $$2}'

run-app:
	cd ./app && yarn dev

run-app-d:
	docker run --rm -it \
		-e NODE_ENV=development \
		-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
		--add-host host.docker.internal:host-gateway \
		--name $(APPNAME)-app \
		--network dev \
		-p $(APP_PORT):7000 \
		-p 24678:24678 \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME)/app sh -c "cd ./app && yarn dev"

install-app:
	docker run -it --rm \
		-e NODE_ENV=development \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME)/app yarn workspace @libertech-fr/teaket_app install

install-service:
	docker run -it --rm \
		-e NODE_ENV=development \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME)/service yarn workspace @libertech-fr/teaket_service install

exec-app:
	docker run -it --rm \
		-e NODE_ENV=development \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME)/service sh

run-service:
	cd ./service && yarn start:dev

run-service-d:
	docker run --rm -it \
		-e NODE_ENV=development \
		-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
		--add-host host.docker.internal:host-gateway \
		--network dev \
		--name $(APPNAME)-service \
		-p $(SERVICE_PORT):7100 \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME)/service sh -c "cd ./service && yarn start:dev"

exec-service:
	docker run -it --rm \
		-e NODE_ENV=development \
		-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
		--add-host host.docker.internal:host-gateway \
		--network dev \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME)/service sh

run: ## Run app and service
	@make dbs &
	@make run-app &
	@make run-service &

dbs: ## Start databases
	@docker volume create $(APPNAME)-mongodb
	@docker run -d --rm \
		--name $(APPNAME)-mongodb \
		-v $(APPNAME)-mongodb:/data/db \
		-p 27017:27017 \
		-e MONGODB_REPLICA_SET_MODE=primary \
		-e MONGODB_REPLICA_SET_NAME=rs0 \
		-e ALLOW_EMPTY_PASSWORD=yes \
		--network dev \
		--health-interval=5s \
		--health-timeout=3s \
		--health-start-period=5s \
		--health-retries=3 \
		--health-cmd="mongo --eval \"db.stats().ok\" || exit 1" \
		mongo:5.0 --replSet rs0 --wiredTigerCacheSizeGB 1.5 || true
	@docker volume create $(APPNAME)-redis
	@docker run -d --rm \
		--name $(APPNAME)-redis \
		-v $(APPNAME)-redis:/data \
		--network dev \
		-p 6379:6379 \
		--health-interval=5s \
		--health-timeout=3s \
		--health-start-period=5s \
		--health-retries=3 \
		--health-cmd="redis-cli ping || exit 1" \
		redis || true
	@docker volume create $(APPNAME)-minio
	@docker run -d --rm \
		-p 9000:9000 \
		-p 9090:9090 \
		--name $(APPNAME)-minio \
		--network dev \
		-v $(APPNAME)-minio:/data \
		-e "MINIO_ACCESS_KEY=$(MINIO_ACCESS_KEY)" \
		-e "MINIO_SECRET_KEY=$(MINIO_SECRET_KEY)" \
		minio/minio server /data --console-address ":9090" || true
	@docker run --rm -it \
		--network dev \
		-e MINIO_BUCKET="teaket" \
		--entrypoint sh minio/mc -c "\
			mc config host add myminio http://teaket-minio:9000 \$(MINIO_ACCESS_KEY) \$(MINIO_SECRET_KEY) && \
			(mc mb myminio/teaket || true) \
		" || true
	@docker exec -it teaket-mongodb mongo --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: '127.0.0.1:27017'}]})" || true

run-mailrest: ## start Mailrest container
	@docker run -it -d --rm \
		--name $(APPNAME)-mailrest \
		--network dev \
		-p $(MAILREST_PORT):7200 \
		-v $(CURDIR)/mailrest/config:/usr/src/app/config \
		-e MR_LOGGER="debug" \
		-e MR_IOREDIS_URL="redis://host.docker.internal:6379/7" \
		-e MR_JWT_SECRET="QOkPuZ99tDowZfUW8i4dlG8NXS6L82Us" \
		-e MR_CRYPT_SECURITYKEY="JfdKI8WCFTba0M3JXZeIb2FwIIhzmQvZ" \
		$(MAILREST_IMAGE) || true

stop-dbs: ## Stop databases
	@docker stop $(APPNAME)-redis || true
	@docker stop $(APPNAME)-mongodb || true
	@docker stop $(APPNAME)-minio || true

build_from_data: ## Build populate image
	docker build -t seeding_from_data -f ./populate/populate_data/Dockerfile ./populate

build_from_gaiasys: ## Build populate image
	docker build -t seeding_from_gaiasys -f ./populate/populate_from_gaiasys/Dockerfile ./populate

populate-db: ## Populate database
	docker run --rm --network dev -v $(CURDIR)/populate:/app -v $(CURDIR)/service/.dev-token.json:/app/.dev-token.json seeding_from_data

populate-from-gaiasys: ## Populate database
	docker run --rm --network dev -v $(CURDIR)/populate:/app -v $(CURDIR)/service/.dev-token.json:/app/.dev-token.json seeding_from_gaiasys

build-app:
	docker build -t teaket-app -f ./app/Dockerfile .

build-service:
	docker build -t teaket-service -f ./service/Dockerfile .
