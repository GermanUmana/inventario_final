const express = require('express');
const path = require('path');
const api = require('./api');
const port = process.env.PORT || 3000;
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', api);

// Root route - serve Angular app
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, function () {
    console.log("Server is listening at port: " + port);
    console.log("Access the application at: http://localhost:" + port);
});