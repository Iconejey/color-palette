// Load color palette from local storage
let palette = JSON.parse(localStorage.getItem('palette')) || ['#121212'];

const main = document.querySelector('main');

// For each color in palette
for (const color of palette) {
	main.appendChild(<color-panel color={color} />);
}
