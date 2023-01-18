// Load color palette from local storage
let palette = JSON.parse(localStorage.getItem('palette')) || ['#121212'];

// For each color in palette
for (const color of palette) {
	document.body.appendChild(<color-panel color={color} />);
}
