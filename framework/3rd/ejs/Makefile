<<<<<<< HEAD

SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

all: ejs.min.js

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec

ejs.js: $(SRC)
	@node support/compile.js $^

ejs.min.js: ejs.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
		&& du ejs.min.js \
		&& du ejs.js

clean:
	rm -f ejs.js
	rm -f ejs.min.js

=======

SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

all: ejs.min.js

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec

ejs.js: $(SRC)
	@node support/compile.js $^

ejs.min.js: ejs.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
		&& du ejs.min.js \
		&& du ejs.js

clean:
	rm -f ejs.js
	rm -f ejs.min.js

>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
.PHONY: test