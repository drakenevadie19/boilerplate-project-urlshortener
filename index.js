require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { redirect } = require('express/lib/response');
const mongoose = require('mongoose');
// Define DNS
const dns = require('dns');
const urlparser = require('url');

const app = express();
const bodyParser = require('body-parser');
// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
 .then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

const urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  short_url: { type: Number, required: true }
});
const Url = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Map URL to a short URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await Url.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.url);
})

// api for URL shortener
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      const urlCount = await Url.countDocuments({});
      const urlDoc = new Url({ url, short_url: urlCount });
      const result = await urlDoc.save();
      res.json({ original_url: url, short_url: urlCount });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
