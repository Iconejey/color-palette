const main = $('main');

// Load color palette from local storage
let palette = JSON.parse(localStorage.getItem('palette')) || [{ color: '#121212', name: null }];

// Save palette to local storage
function savePalette() {
	const panels = $$('color-panel:not(.removed)');

	// If no panels, ignore
	if (!panels.length) return;

	palette.length = 0;

	for (const panel of panels) {
		palette.push({ color: panel.color, name: panel.name });
	}

	localStorage.setItem('palette', JSON.stringify(palette));
}

// Add color panels to main
for (const { color, name } of palette) {
	const panel = render`<color-panel color="${color}" />`;

	if (name) {
		panel.name = name;
		panel.name_input.textContent = name;
		panel.name_changed = true;
	}

	main.appendChild(panel);
}

// When double clicking, toggle edit mode
main.ondblclick = e => {
	document.body.classList.toggle('edit');
};
