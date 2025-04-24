const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/offer', async (req, res) => {
  try {
    const response = await axios.get('https://overbridgenet.com/jsv8/offer');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching offer' });
  }
});

module.exports = router;
