require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { redirect } = require('express/lib/response');
const app = express();
const bodyParser = require('body-parser');

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory database simulation (hashmap)
const urlDb = new Map();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Function to generate URL number param
function shortenURL(longUrl) {
  let key = Math.floor(Math.random()*3000);
  while (urlDb.has(key)) { // Ensure the key is unique
    key = Math.floor(Math.random()*3000);
  }
  urlDb.set(key, longUrl);
  return key;
}

// Map URL to a short URL
app.get('/api/shorturl/:number', (req, res) => {
  const key = parseInt(req.params.number, 10);
  if (urlDb.has(key)) {
    redirect(urlDb.get(key));
  } else {
    res.status(400).send('This shorten URL was not mapped to any URL');
  }
})

// api for URL shortener
app.post('/api/shorturl', (req, res) => {
  const longUrl = req.body.url;
  // const longUrl = ""; 
  // const longUrl = req.body.url_input;
  if (!longUrl) {
    return res.status(400).send('URL is required');
  }

  const numberMatch = shortenURL(longUrl);
  console.log(numberMatch);
  res.send({ "original_url":longUrl, "short_url":numberMatch })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
