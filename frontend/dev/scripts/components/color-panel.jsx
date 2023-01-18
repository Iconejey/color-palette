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

		this.color = this.getAttribute('color') ?? '#121212';
	}

	set color(color) {
		// Set panel color
		this.setAttribute('style', `background-color: ${color};`);

		// Set color text
		this.querySelector('#color').innerText = color;

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
