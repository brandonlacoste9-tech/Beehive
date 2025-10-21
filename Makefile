SHELL := /bin/bash

.PHONY: dev smoke build zip wiki install echo-meta

install:
	npm install

echo-meta:
	node -e "console.log(JSON.stringify({ ritual: 'make-meta', status: 'alive' }))"

dev:
	npm run dev

smoke:
	npm run smoke

build:
	npm run build

zip: build
	npm run swarm:zip

wiki:
	npm run wiki
