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

app.get('/ping', (req, res) => {

    const queryParams = req.query;

    const filePath = path.join(__dirname, './build', 'index.html');

    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) {
            return res.status(500).send('An error occurred');
        }

        // Optionally inject the query parameters into the HTML
        const injectedHtml = html.replace(
            '<script id="query-params"></script>',
            `<script>
                window.__QUERY_PARAMS__ = ${JSON.stringify(queryParams)};
            </script>`
        );

        // Send the modified HTML back to the client
        res.send(injectedHtml);
    });

});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
