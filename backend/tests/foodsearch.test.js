const request = require('supertest');
const app = require('../app');

describe('GET /api/foodsearch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('requires a q query parameter', async () => {
    const res = await request(app).get('/api/foodsearch');
    expect(res.status).toBe(400);
    expect(res.body.results).toEqual([]);
  });

  it('maps Open Food Facts products into simplified results', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hits: [
          {
            product_name: 'Test Cereal',
            brands: ['TestBrand'],
            nutriments: {
              'energy-kcal_100g': 380.4,
              proteins_100g: 9.6,
              carbohydrates_100g: 70.2,
              fat_100g: 4.8,
            },
          },
          // missing calories should be filtered out
          { product_name: 'No Calorie Data', nutriments: {} },
        ],
      }),
    });

    const res = await request(app).get('/api/foodsearch?q=cereal');
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0]).toMatchObject({
      name: 'Test Cereal',
      brand: 'TestBrand',
      calories: 380,
      protein: 10,
      carbs: 70,
      fat: 5,
      basis: 'per 100g',
    });
  });

  it('returns a 502 when the upstream provider fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    const res = await request(app).get('/api/foodsearch?q=cereal');
    expect(res.status).toBe(502);
  });
});
