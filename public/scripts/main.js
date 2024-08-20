const main = $('main');

const default_palette = [
	{ color: '#f07178', name: null },
	{ color: '#f78c6c', name: null },
	{ color: '#ffcb6b', name: null },
	{ color: '#c3e88d', name: null },
	{ color: '#89ddff', name: null },
	{ color: '#82aaff', name: null },
	{ color: '#c792ea', name: null }
];

// Load color palette from local storage
let palette = JSON.parse(localStorage.getItem('palette')) || default_palette;

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

	panel.name = name || null;

	main.appendChild(panel);
}

// When double clicking, toggle edit mode
main.ondblclick = e => {
	if (e.target.tagName === 'COLOR-PANEL') document.body.classList.toggle('edit');
};
