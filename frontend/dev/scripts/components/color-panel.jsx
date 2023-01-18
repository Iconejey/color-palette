class ColorPanel {
	// <color-panel />

	created() {
		// Show color text in panel
		<This>
			<span id="close" class="icon" title="Remove color">
				close
			</span>
			<span id="copy" class="icon" title="Copy hex code">
				copy_all
			</span>
			<span id="color" title="Edit color" contentEditable>
				121212
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
	}

	set color(color) {
		// Set panel color
		this.setAttribute('style', `background-color: ${color};`);

		// Choose white or black text depending on panel color brightness
		let [r, g, b] = color.match(/\w\w/g).map(x => parseInt(x, 16));
		let brightness = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);

		this.classList.toggle('dark', brightness < 128);

		// Save color in attributes
		this.setAttribute('color', color);
	}

	get color() {
		return this.getAttribute('color');
	}
}
