const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/get-title', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Use YouTube oEmbed API to get video details
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oembedUrl);
    
    if (response.data && response.data.title) {
      return res.json({ title: response.data.title });
    } else {
      return res.status(404).json({ error: 'Title not found' });
    }
  } catch (error) {
    console.error('Error fetching title:', error.message);
    return res.status(500).json({ error: 'Failed to fetch video title. Please check the URL.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
