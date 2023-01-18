// Load color palette from local storage
let palette = JSON.parse(localStorage.getItem('palette')) || ['#121212'];

const main = document.querySelector('main');

// For each color in palette
for (const color of palette) {
	main.appendChild(<color-panel color={color} />);
}

// Save palette to local storage
function savePalette() {
	palette = [...document.querySelectorAll('color-panel:not(.removed)')].map(color => color.color);
	localStorage.setItem('palette', JSON.stringify(palette));
}
