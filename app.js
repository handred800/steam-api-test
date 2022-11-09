// These import necessary modules and set some initial variables
require("dotenv").config();
const express = require("express");
const fs = require('fs');
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");
const md = require("node-markdown").Markdown;
const app = express();
const port = process.env.PORT || 3000;

// Rate limiting - Goodreads limits to 1/sec, so we should too

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

const limiter = rateLimit({
	windowMs: 1000, // 1 second
	max: 1, // limit each IP to 1 requests per windowMs
})

//  apply to all requests
app.use(limiter)

// Routes
app.get("/", (req, res) => {

	fs.readFile('README.md', function (err, data) {
		if (err) throw err;
		html = md(data.toString())
	    res.send(html);
	});

	
});

// Our Goodreads relay route!
app.get("/api/search", async (req, res) => {
	try {
		const searchString = `appids=${req.query.appids}`;

		const response = await fetch(`http://store.steampowered.com/api/appdetails?${searchString}&l=tchinese`)
		const json = await response.json();

		res.header('Access-Control-Allow-Origin', '*');
  		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

		return res.json({
            success: true,
            data:json[req.query.appids].data
        })
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: err.message
		})
	}
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
