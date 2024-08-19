/*
Tag function for HTML text.
Used for syntax highlighting, code completion and formatting.
Mostly used with HTMLElement.innerHTML and inside a component constructor:

this.innerHTML = html`
    <div class="my-class">
        <span>Hello World</span>
    </div>
`;

Also handles self closing custom elements (no need to add a closing tag):

this.innerHTML = html`
    <text-input id="user-email" type="email" icon="email" />
    <node-panel content="btn:done/save-account" accent="blue" />
`;
*/
function html(strings, ...values) {
	// Get text
	let text = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

	// Handle self closing custom elements (ignore native self closing elements)
	text = text.replaceAll(/<([\w-]+)[^>]*\/>/g, (match, tag) => {
		// If tag contains a dash, it's a custom element
		if (tag.includes('-')) return match.replace('/>', `></${tag}>`);

		// Else it's a native element, ignore
		return match;
	});

	// Return text
	return text;
}

/*
Tag function to render HTML code
Allow to use HTML code to create an HTMLElement
Quicker than using document.createElement and appendChild
Uses the html tag function to create the text and handle self closing custom elements

const div = render`
    <div class="my-class">
        <span>Hello World</span>
    </div>
`;
*/
function render(strings, ...values) {
	const div = document.createElement('div');
	div.innerHTML = html(strings, ...values);
	const elem = div.firstElementChild;
	elem.remove();
	return elem;
}

// Define component with getters and setters for attributes and classes
// Example: defineComponent(html`<my-component value-attr bool-attr? .my-class />`);
function defineComponent(map) {
	// Get tag name
	const tag = /<([\w-]+)[^>]*>/.exec(map)[1];

	// Deduce class name
	const class_name = tag
		.split('-')
		.map(s => s[0].toUpperCase() + s.slice(1))
		.join('');

	// Get class from string
	const cls = eval(class_name);

	// Define custom element
	customElements.define(tag, cls);

	// Get attributes
	const attrs = map
		.replace(/<[\w-]+/, '')
		.replace(/><\/[\w-]+>/, '')
		.split(' ')
		.filter(Boolean);

	// Add getters and setters for attributes and classes
	for (const attr of attrs) {
		// Get attribute name
		const name = attr.replace(/[\?\.]/, '').replaceAll('-', '_');

		// If class
		if (attr.includes('.')) {
			Object.defineProperty(cls.prototype, name, {
				get() {
					return this.classList.contains(name);
				},

				set(value) {
					this.classList.toggle(name, value);
				}
			});
		}

		// If boolean attribute
		else if (attr.includes('?')) {
			Object.defineProperty(cls.prototype, name, {
				get() {
					return this.hasAttribute(name);
				},

				set(value) {
					this.toggleAttribute(name, value);
				}
			});
		}

		// If value attribute
		else {
			Object.defineProperty(cls.prototype, name, {
				get() {
					return this.getAttribute(name);
				},

				set(value) {
					this.setAttribute(name, value);
				}
			});
		}
	}
}

// Add $() function to HTMLElement prototype
Object.defineProperty(HTMLElement.prototype, '$', {
	get() {
		return this.querySelector.bind(this);
	}
});

// Add $$() function to HTMLElement prototype
Object.defineProperty(HTMLElement.prototype, '$$', {
	get() {
		return this.querySelectorAll.bind(this);
	}
});

// Same for ShadowRoot prototype
Object.defineProperty(ShadowRoot.prototype, '$', {
	get() {
		return this.querySelector.bind(this);
	}
});

Object.defineProperty(ShadowRoot.prototype, '$$', {
	get() {
		return this.querySelectorAll.bind(this);
	}
});

// $() function
function $(selector) {
	return document.querySelector(selector);
}

// $$() function
function $$(selector) {
	return document.querySelectorAll(selector);
}

class CustomElement extends HTMLElement {
	static ready = false;

	constructor() {
		super();
	}

	whenReady(callback) {
		if (CustomElement.ready) callback();
		else window.addEventListener('load', () => callback());
	}

	attributeChangedCallback(name, oldVal, newVal) {
		this.whenReady(() => {
			const title_case = name.slice(0, 1).toUpperCase() + name.slice(1);
			this[`on${title_case}Change`]?.(newVal);
		});
	}
}

window.addEventListener('load', () => {
	CustomElement.ready = true;
});
