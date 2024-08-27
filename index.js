const express = require('express');
const app = express();
const path = require('path');
const cors = require("cors");
const nocache = require('nocache');
const fs = require('fs');
const port = process.env.PORT || 3000;

/* Serve static files from the React app */
app.use(express.static(path.join(__dirname, 'build')));

/* Allows app to handle JSON POST data */
app.use(express.json());

/* All access from all origins */
app.use(cors());

/* No cache */
app.use(nocache());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
