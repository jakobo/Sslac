all: sslac cleantmp

requires: smoosh qunit

smoosh:
	npm install smoosh

qunit:
	npm install qunit

sslac:
	node Makefile.js

cleantmp:
	rm -rf tmp

clean:
	rm -rf artifacts/*.js