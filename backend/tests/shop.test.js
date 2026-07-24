const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const PetState = require('../models/PetState');

describe('GET /api/shop/catalog', () => {
  it('returns the static item list', async () => {
    const res = await request(app).get('/api/shop/catalog');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.some((i) => i.id === 'meadow')).toBe(true);
  });
});

describe('GET /api/shop/state/:userId', () => {
  it('creates a default pet state for a user with none yet', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/shop/state/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.coins).toBe(0);
    expect(res.body.equippedBackground).toBe('meadow');
    expect(res.body.ownedItems).toEqual([]);
  });
});

describe('POST /api/shop/claim-daily', () => {
  it('awards the bonus once, then withholds it for a second claim same day', async () => {
    const userId = new mongoose.Types.ObjectId().toString();

    const first = await request(app).post('/api/shop/claim-daily').send({ userId });
    expect(first.body.awarded).toBe(true);
    expect(first.body.coins).toBe(15);

    const second = await request(app).post('/api/shop/claim-daily').send({ userId });
    expect(second.body.awarded).toBe(false);
    expect(second.body.coins).toBe(15);
  });
});

describe('POST /api/shop/purchase', () => {
  it('rejects a purchase without enough coins', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/shop/purchase').send({ userId, itemId: 'sunset' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not enough coins/i);
  });

  it('rejects an unknown item id', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/shop/purchase').send({ userId, itemId: 'does-not-exist' });
    expect(res.status).toBe(404);
  });

  it('deducts coins and adds the item once enough coins are earned', async () => {
    const userId = new mongoose.Types.ObjectId();
    await PetState.create({ userId, coins: 100 });

    const res = await request(app)
      .post('/api/shop/purchase')
      .send({ userId: userId.toString(), itemId: 'plant' });

    expect(res.status).toBe(200);
    expect(res.body.coins).toBe(80);
    expect(res.body.ownedItems).toContain('plant');
  });

  it('rejects buying the same item twice', async () => {
    const userId = new mongoose.Types.ObjectId();
    await PetState.create({ userId, coins: 100, ownedItems: ['plant'] });

    const res = await request(app)
      .post('/api/shop/purchase')
      .send({ userId: userId.toString(), itemId: 'plant' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already owned/i);
  });
});

describe('POST /api/shop/equip', () => {
  it('rejects equipping an item that is not owned', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/shop/equip').send({ userId, itemId: 'sunset' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not owned/i);
  });

  it('lets the default free background be equipped without owning it', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/shop/equip').send({ userId, itemId: 'meadow' });
    expect(res.status).toBe(200);
    expect(res.body.equippedBackground).toBe('meadow');
  });

  it('swaps the single background slot rather than accumulating', async () => {
    const userId = new mongoose.Types.ObjectId();
    await PetState.create({ userId, ownedItems: ['sunset', 'night'] });

    await request(app).post('/api/shop/equip').send({ userId: userId.toString(), itemId: 'sunset' });
    const res = await request(app).post('/api/shop/equip').send({ userId: userId.toString(), itemId: 'night' });

    expect(res.body.equippedBackground).toBe('night');
  });

  it('toggles furniture on and back off', async () => {
    const userId = new mongoose.Types.ObjectId();
    await PetState.create({ userId, ownedItems: ['rug'] });

    const on = await request(app).post('/api/shop/equip').send({ userId: userId.toString(), itemId: 'rug' });
    expect(on.body.equippedFurniture).toContain('rug');

    const off = await request(app).post('/api/shop/equip').send({ userId: userId.toString(), itemId: 'rug' });
    expect(off.body.equippedFurniture).not.toContain('rug');
  });
});
