// These import necessary modules and set some initial variables
require("dotenv").config();
const express = require("express");
const fs = require('fs');
const fetch = require("node-fetch");
const convert = require("xml-js");
const rateLimit = require("express-rate-limit");
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

// Test route, visit localhost:3000 to confirm it's working
app.get("/", (req, res) => {

	fs.readFile('README.md', function (err, data) {
	    if (err) throw err; 
	    res.send(data.toString());
	});	
	// res.send("Welcome!")
});

// Our Goodreads relay route!
app.get("/api/search", async (req, res) => {
	try {
		// This uses string interpolation to make our search query string
		// it pulls the posted query param and reformats it for goodreads
		const searchString = `appids=${req.query.appids}`;

		// It uses node-fetch to call the goodreads api, and reads the key from .env
		// const response = await fetch(`https://www.goodreads.com/search/index.xml?key=${process.env.GOODREADS_API_KEY}&${searchString}`);
		const response = await fetch(`http://store.steampowered.com/api/appdetails?${searchString}`)
		const json = await response.json();

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

// This spins up our sever and generates logs for us to use.
// Any console.log statements you use in node for debugging will show up in your
// terminal, not in the browser console!
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
