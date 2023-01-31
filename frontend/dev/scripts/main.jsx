const main = document.querySelector('main');

// Load color palette from local storage
let palette = JSON.parse(localStorage.getItem('palette')) || ['#121212'];

// Save palette to local storage
function savePalette() {
	palette = [...document.querySelectorAll('color-panel:not(.removed)')].map(color => color.color);
	localStorage.setItem('palette', JSON.stringify(palette));
}

onload = () => {
	// Add color panels to main
	for (const color of palette) {
		main.appendChild(<color-panel color={color} />);
	}
};
