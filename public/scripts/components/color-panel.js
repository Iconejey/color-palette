class ColorPanel extends CustomElement {
	static getRGB(color) {
		return color.match(/\w\w/g).map(x => parseInt(x, 16));
	}

	static isBright(color) {
		let [r, g, b] = ColorPanel.getRGB(color);
		let brightness = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);

		return brightness > 127;
	}

	static mix(color1, color2) {
		let [r1, g1, b1] = ColorPanel.getRGB(color1);
		let [r2, g2, b2] = ColorPanel.getRGB(color2);

		let r = Math.floor((r1 + r2) / 2);
		let g = Math.floor((g1 + g2) / 2);
		let b = Math.floor((b1 + b2) / 2);

		return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
	}

	constructor() {
		super();

		this.whenReady(() => {
			// Show color text in panel
			this.innerHTML = html`
				<span id="add-left" class="icon add" title="Add color">add</span>
				<span id="close" class="icon" title="Remove color">close</span>
				<span id="move" class="icon" title="Move color">import_export</span>
				<span id="copy" class="icon" title="Copy hex code">copy_all</span>
				<span id="color" title="Edit color" contentEditable>121212</span>
				<span id="name" title="Edit name" contentEditable>test</span>
				<span id="add-right" class="icon add" title="Add color">add</span>
			`;

			// Inputs
			this.name_input = this.$('#name');
			this.color_input = this.$('#color');
			this.name_changed = false;
			this.name = null;

			// Set color
			this.color = this.getAttribute('color') ?? '#121212';
			this.color_input.innerText = this.color.replace('#', '');

			// Listen for color edit
			this.color_input.oninput = e => {
				let color = this.color_input.innerText;

				// Ignore spaces
				if (/\s/.test(color)) {
					this.color_input.innerText = color.replace(/\s/g, '');
					color = this.color_input.innerText;
				}

				const invalid = this.color_input.classList.toggle('invalid', !/^[0-9a-f]{6}$/i.test(color));
				if (!invalid) this.color = '#' + color;
			};

			// Listen for color paste
			this.color_input.onpaste = e => {
				e.preventDefault();
				const text = e.clipboardData.getData('text/plain');
				this.color_input.innerText = text.replace(/[^0-9a-f]/gi, '');
				this.color_input.dispatchEvent(new Event('input'));
			};

			const checkName = () => {
				let trimmed = this.name_input.innerText.replace(/\n/g, '').trim();

				// If empty, set name to color
				if (!trimmed) {
					this.name_input.innerText = ntc.name(this.color)[1];
					this.name_changed = false;
					this.name = null;
				}

				// Else set name
				else this.name_input.innerText = trimmed;

				// Save palette
				savePalette();
			};

			// Listen for name edit
			this.name_input.oninput = e => {
				this.name_changed = true;

				// Ignore line breaks
				if (/\n/.test(this.name_input.innerText)) {
					checkName();
				}

				// Else set name and save palette
				else {
					this.name = this.name_input.innerText.trim();
					savePalette();
				}
			};

			// Listen for name blur
			this.name_input.onblur = e => checkName();

			// Add btns
			const add_left = this.$('#add-left');
			const add_right = this.$('#add-right');

			// Listen for left add button hover
			add_left.onmouseenter = e => {
				// Get left panel color
				const mixed = this.getLeftMixedColor();
				const text_color = ColorPanel.isBright(mixed) ? 'black' : 'white';

				// Set btn background color
				add_left.setAttribute('style', `background-color: ${mixed}; color: ${text_color}`);
			};

			// Listen for left add button click
			add_left.onclick = e => {
				// Get left panel color
				const mixed = this.getLeftMixedColor();

				// Create new panel
				const panel = render`<color-panel color=${mixed} />`;
				this.parentElement.insertBefore(panel, this);
			};

			// Listen for right add button hover
			add_right.onmouseenter = e => {
				// Get right panel color
				const mixed = this.getRightMixedColor();
				const text_color = ColorPanel.isBright(mixed) ? 'black' : 'white';

				// Set btn background color
				add_right.setAttribute('style', `background-color: ${mixed}; color: ${text_color}`);
			};

			// Listen for right add button click
			add_right.onclick = e => {
				// Get right panel color
				const mixed = this.getRightMixedColor();

				// Create new panel
				const panel = render`<color-panel color=${mixed} />`;
				this.parentElement.insertBefore(panel, this.nextElementSibling);
			};

			// Listen for close button click
			this.$('#close').onclick = e => {
				// Check if app is in landscape mode
				const ls = innerWidth > innerHeight;

				// Set panel size for animation
				if (ls) this.style.maxWidth = this.offsetWidth + 'px';
				else this.style.maxHeight = this.offsetHeight + 'px';

				// Start animation
				this.removed = true;

				// Remove panel after animation
				setTimeout(() => this.remove(), 200);

				// Save palette
				savePalette();
			};

			// Copy btn
			const copy = this.$('#copy');

			// Listen for copy button click
			copy.onclick = e => {
				// Copy hex code to clipboard
				navigator.clipboard.writeText(this.color.replace('#', ''));

				// Show check icon for 500ms
				copy.innerText = 'check';
				setTimeout(() => (copy.innerText = 'copy_all'), 500);
			};

			// Move btn
			const move = this.$('#move');

			// Listen for move button mousedown
			move.onmousedown = e => {
				// Set panel to be moved
				this.moving = true;

				// Check if app is in landscape mode
				const ls = innerWidth > innerHeight;

				// Save mouse position
				this.move_start = ls ? e.clientX : e.clientY;
			};

			// Listen for panel mouseup
			this.onmouseup = e => {
				// Reset panel to be moved
				this.moving = false;

				// Remove panel transform
				this.style.transform = '';
			};

			// Listen for panel mousemove
			this.onmousemove = e => {
				// Only panel is being moved
				if (!this.moving) return;

				// Check if app is in landscape mode
				const ls = innerWidth > innerHeight;

				// Get mouse position
				let pos = ls ? e.clientX : e.clientY;

				// Set panel transform
				this.style.transform = `translate${ls ? 'X' : 'Y'}(${pos - this.move_start}px)`;

				// Get panel size
				const size = ls ? this.offsetWidth : this.offsetHeight;

				// Switch with left panel
				if (pos - this.move_start < -size / 2) {
					const prev = this.previousElementSibling;
					const prev_size = ls ? prev.offsetWidth : prev.offsetHeight;

					// Move previous panel before this panel
					this.parentElement.insertBefore(this, prev);
					prev.slide = true;
					prev.style.transform = `translate${ls ? 'X' : 'Y'}(-${size}px)`;
					setTimeout(() => {
						prev.slide = false;
						prev.style.transform = '';
					}, 10);

					// Update panel position
					this.move_start -= prev_size;
					this.style.transform = `translate${ls ? 'X' : 'Y'}(${pos - this.move_start}px)`;

					// Save palette
					savePalette();
				}

				// Switch with right panel
				if (pos - this.move_start > size / 2) {
					const next = this.nextElementSibling;
					const next_size = ls ? next.offsetWidth : next.offsetHeight;

					// Move next panel after this panel
					this.parentElement.insertBefore(next, this);
					next.slide = true;
					next.style.transform = `translate${ls ? 'X' : 'Y'}(${size}px)`;
					setTimeout(() => {
						next.slide = false;
						next.style.transform = '';
					}, 10);

					// Update panel position
					this.move_start += next_size;
					this.style.transform = `translate${ls ? 'X' : 'Y'}(${pos - this.move_start}px)`;

					// Save palette
					savePalette();
				}
			};
		});
	}

	getLeftMixedColor() {
		// Get left panel color or default to black
		const left_color = this.previousElementSibling?.color ?? '#000000';

		// Mix with current color
		return ColorPanel.mix(this.color, left_color);
	}

	getRightMixedColor() {
		// Get right panel color or default to white
		const right_color = this.nextElementSibling?.color ?? '#ffffff';

		// Mix with current color
		return ColorPanel.mix(this.color, right_color);
	}

	set color(color) {
		// Set panel color
		this.setAttribute('style', `background-color: ${color};`);

		// Choose white or black text depending on panel color brightness
		this.classList.toggle('dark', ColorPanel.isBright(color));

		// Save color in attributes
		this.setAttribute('color', color);

		// Set name
		if (!this.name_changed) this.name_input.innerText = ntc.name(color)[1];

		// Save palette
		setTimeout(() => savePalette(), 1);
	}

	get color() {
		return this.getAttribute('color');
	}
}

defineComponent(html`<color-panel .moving .slide .removed />`);
