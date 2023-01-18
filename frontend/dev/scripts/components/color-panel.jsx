class ColorPanel {
	// <color-panel />

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

	created() {
		// Show color text in panel
		<This>
			<span id="add-left" class="icon add" title="Add color">
				add
			</span>

			<span id="close" class="icon" title="Remove color">
				close
			</span>
			<span id="move" class="icon" title="Move color">
				import_export
			</span>
			<span id="copy" class="icon" title="Copy hex code">
				copy_all
			</span>
			<span id="color" title="Edit color" contentEditable>
				121212
			</span>

			<span id="add-right" class="icon add" title="Add color">
				add
			</span>
		</This>;

		// Set color
		this.color = this.getAttribute('color') ?? '#121212';

		this.input = this.querySelector('#color');
		this.input.innerText = this.color.replace('#', '');

		// Listen for color edit
		this.input.oninput = e => {
			let color = this.input.innerText;

			// Ignore spaces
			if (/\s/.test(color)) {
				this.input.innerText = color.replace(/\s/g, '');
				color = this.input.innerText;
			}

			const invalid = this.input.classList.toggle('invalid', !/^[0-9a-f]{6}$/i.test(color));
			if (!invalid) this.color = '#' + color;
		};

		// Listen for color paste
		this.input.onpaste = e => {
			e.preventDefault();
			const text = e.clipboardData.getData('text/plain');
			this.input.innerText = text.replace(/[^0-9a-f]/gi, '');
			this.input.dispatchEvent(new Event('input'));
		};

		// Add btns
		const add_left = this.querySelector('#add-left');
		const add_right = this.querySelector('#add-right');

		// Listen for left add button hover
		add_left.onmouseenter = e => {
			// Get left panel color or default to black
			const left_color = this.previousElementSibling?.color ?? '#000000';

			// Mix with current color
			const mixed = ColorPanel.mix(this.color, left_color);

			// Set btn background color
			add_left.setAttribute('style', `background-color: ${mixed}; color: ${ColorPanel.isBright(mixed) ? 'black' : 'white'}`);
		};

		// Listen for right add button hover
		add_right.onmouseenter = e => {
			// Get right panel color or default to white
			const right_color = this.nextElementSibling?.color ?? '#ffffff';

			// Mix with current color
			const mixed = ColorPanel.mix(this.color, right_color);

			// Set btn background color
			add_right.setAttribute('style', `background-color: ${mixed}; color: ${ColorPanel.isBright(mixed) ? 'black' : 'white'}`);
		};
	}

	set color(color) {
		// Set panel color
		this.setAttribute('style', `background-color: ${color};`);

		// Choose white or black text depending on panel color brightness
		this.classList.toggle('dark', ColorPanel.isBright(color));

		// Save color in attributes
		this.setAttribute('color', color);
	}

	get color() {
		return this.getAttribute('color');
	}
}
