.DEFAULT_GOAL := help
.PHONY: help build development vendorjs

development: ## Build for development environment
	ENVIRONMENT=development make build

build: build/css/styles.min.css build/js/app.min.js build/index.html build/favicon.ico build/robots.txt ## Build for production environment

build/js:
	mkdir -p build/js

vendorjs: vendor/*.js vendor/**/*.js vendor/**/**/*.js
	mkdir -p vendor
  # babel will ignore everything in node_modules so we need to copy it somewhere
	cp -u node_modules/isemail/lib/index.js vendor/isemail.js
	mkdir -p vendor/rheactor-value-objects
	cp -u node_modules/rheactor-value-objects/*.js vendor/rheactor-value-objects
	mkdir -p vendor/rheactor-web-app/js/
	cp -u -r node_modules/rheactor-web-app/js/* vendor/rheactor-web-app/

build/js/app.js: package.json build/js frontend/js/*.js frontend/js/**/*.js vendorjs
	./node_modules/.bin/browserify frontend/js/app.js -o $@

build/js/app.min.js: build/js/app.js
ifeq "${ENVIRONMENT}" "development"
	cp -u build/js/app.js $@
else
	./node_modules/.bin/uglifyjs build/js/app.js -o $@
endif

build/css:
	mkdir -p build/css

build/css/styles.css: frontend/scss/*.scss build/fonts node_modules/rheactor-web-app/scss/*.scss
	./node_modules/.bin/node-sass frontend/scss/styles.scss $@

build/fonts: node_modules/material-design-icons/iconfont/MaterialIcons-Regular.*
	mkdir -p build/fonts
	cp -u node_modules/material-design-icons/iconfont/MaterialIcons-Regular.* build/fonts/

build/css/styles.min.css: build/css build/css/styles.css
ifeq ($(ENVIRONMENT),development)
	cp -u build/css/styles.css $@
else
	./node_modules/.bin/uglifycss build/css/styles.css > $@
endif

build/index.html: frontend/*.html frontend/includes/*.html build/img
	mkdir -p build/view/directive
	./node_modules/.bin/rheactor-build-views build ./server/config/config ./frontend ./build -i ./node_modules/rheactor-web-app/includes/

build/robots.txt: frontend/robots.txt
	cp frontend/robots.txt build/

build/img: frontend/img/*.*
	mkdir -p build/img
	cp -u -r frontend/img/* build/img/
	cp -u -r node_modules/rheactor-web-app/img/* build/img/

build/favicon.ico: frontend/favicon/*.*
	cp -u frontend/favicon/* build/

deploy: ## Deploy to production
	rm -rf build
	ENVIRONMENT=production make -B build
	rm build/js/app.js
	rm build/css/styles.css
	s3cmd sync --delete-removed ./build/ s3://`node server/console config aws:website_bucket`/

help: ## (default), display the list of make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
