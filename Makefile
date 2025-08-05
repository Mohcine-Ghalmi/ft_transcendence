build:
	mkdir -p /goinfre/${USER}/sqlite_db
	docker compose -f  docker-compose.yml build

up:
	docker compose -f docker-compose.yml up -d --remove-orphans

down:
	docker compose -f docker-compose.yml down

clean:
	rm -rf /goinfre/${USER}/sqlite_db
	./clean.sh