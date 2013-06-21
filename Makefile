
build: components assets/index.js assets/spa.css
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

serve:
	nodemon index.js

.PHONY: clean
