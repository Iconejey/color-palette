const express = require('express');

// App
const app = express();

// Global
app.use('/', express.static('public'));

// Start the server
app.listen(8006, () => console.log('Server started'));
