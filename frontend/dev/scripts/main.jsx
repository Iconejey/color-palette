const main = document.querySelector('main');

// Load color palette from local storage
let palette = JSON.parse(localStorage.getItem('palette')) || [{ color: '#121212', name: null }];

// Save palette to local storage
function savePalette() {
	const panels = document.querySelectorAll('color-panel:not(.removed)');

	console.log(panels.length);

	// If no panels, ignore
	if (!panels.length) return;

	palette.length = 0;

	for (const panel of panels) {
		palette.push({ color: panel.color, name: panel.name });
	}

	localStorage.setItem('palette', JSON.stringify(palette));
}

onload = () => {
	// Add color panels to main
	for (const { color, name } of palette) {
		const panel = <color-panel color="{color}" />;

		if (name) {
			panel.name = name;
			panel.name_input.textContent = name;
			panel.name_changed = true;
		}

		main.appendChild(panel);
	}
};
