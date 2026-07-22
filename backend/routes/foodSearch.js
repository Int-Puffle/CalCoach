const express = require('express');
const router = express.Router();

// GET /api/foodsearch?q=<name> - search foods via Open Food Facts (free, no API key)
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ error: 'q query parameter is required', results: [] });
  }

  try {
    const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(q)}&fields=product_name,brands,nutriments&page_size=10`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CalCoach - Educational Project - https://cal-coach.xyz' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Food search provider unavailable', results: [] });
    }

    const data = await response.json();
    const results = (data.products || [])
      .filter((p) => p.product_name && p.nutriments && p.nutriments['energy-kcal_100g'] != null)
      .slice(0, 10)
      .map((p) => ({
        name: p.product_name,
        brand: p.brands || '',
        calories: Math.round(p.nutriments['energy-kcal_100g']),
        protein: Math.round(p.nutriments['proteins_100g'] || 0),
        carbs: Math.round(p.nutriments['carbohydrates_100g'] || 0),
        fat: Math.round(p.nutriments['fat_100g'] || 0),
        basis: 'per 100g',
      }));

    res.status(200).json({ results, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString(), results: [] });
  }
});

module.exports = router;
