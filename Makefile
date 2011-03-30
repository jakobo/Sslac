all: smoosh sslac cleantmp

smoosh:
	npm install smoosh

sslac:
	node Makefile.js

cleantmp:
	rm -rf tmp

clean:
	rm -rf artifacts/*.js