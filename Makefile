MAKEFLAGS += j4

.PHONY: clean test build
.DEFAULT_GOAL := build

clean:
	rm -rf dist
	mkdir -p dist

build: build-cjs

build-cjs: clean test
	npx babel --env-name cjs --out-dir ./dist ./src

test:
	npx mocha --config mocha.config.json test
	
bump-alpha: build
	npm version prerelease --preid alpha

bump-patch: build
	npm version patch

bump-minor: build
	npm version minor

bump-major: build
	npm version major

publish-alpha: build
	git push --tags origin HEAD:main
	npm publish --access public --tag alpha

publish: build
	git push --tags origin HEAD:main
	npm publish --access public
