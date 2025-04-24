// api/offer.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get('https://overbridgenet.com/jsv8/offer');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer data' });
  }
}
