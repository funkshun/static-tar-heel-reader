pages: dist/find.html dist/settings.html dist/favorites.html dist/choose.html dist/collections.html dist/index.html dist/web_modules/stemr.js dist/web_modules/idb.js

dist/%.html: src/%.html
	python3 ./copypage.py $<
	
dist/find.html: src/find.html src/find.css src/head.mako src/menu.mako

dist/choose.html: src/choose.html src/find.css src/head.mako src/menu.mako

dist/settings.html: src/settings.html src/settings.css src/head.mako src/menu.mako

dist/index.html: src/index.html src/index.css src/head.mako

dist/favorites.html: src/favorites.html src/favorites.css src/head.mako

dist/collections.html: src/collections.html src/collections.css src/collections.mako

dist/web_modules/stemr.js: src/web_modules/stemr.js
	mkdir -p dist/web_modules
	cp $< $@

dist/web_modules/idb.js: src/web_modules/idb.js
	mkdir -p dist/web_modules
	cp $< $@

watch:
	fswatch -o src -e ".*\\.swp" --event=Created --event=Updated --latency=2 | xargs -n1 -I{} $(MAKE) --no-print-directory

tiny: pages
	rm -f /var/www/static/tiny/*.js /var/www/static/tiny/*.css
	./generate.py out=/var/www/static/tiny Nselect=100
	cp -a dist/* /var/www/static/tiny/
	cp -a web_modules /var/www/static

test:
	jest test --coverage

fetch:
	cd data && python3 fetchBooks.py $(out)

fetch-collections:
	cd data && python3 fetchCollections.py

generate:
	python3 generate.py out="./dist" Nselect=$(Nselect)

install-dev:
	npm install -g typescript jest stylelint stylelint-config-prettier stylelint-config-standard @pika/web

run-local: pages
	tsc
	cd dist && python3 -m http.server

clean: 
	rm -rf dist
