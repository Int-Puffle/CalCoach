const express = require('express');
const router = express.Router();
const PetState = require('../models/PetState');
const { SHOP_ITEMS, SHOP_ITEMS_BY_ID } = require('../data/shopItems');

const DAILY_LOGIN_BONUS = 15;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function getOrCreatePetState(userId) {
  let petState = await PetState.findOne({ userId });
  if (!petState) {
    petState = await PetState.create({ userId });
  }
  return petState;
}

// GET /api/shop/catalog - static item list, no auth needed
router.get('/catalog', (req, res) => {
  res.status(200).json({ items: SHOP_ITEMS, error: '' });
});

// GET /api/shop/state/:userId - coins, owned items, equipped items
router.get('/state/:userId', async (req, res) => {
  try {
    const petState = await getOrCreatePetState(req.params.userId);
    res.status(200).json({
      coins: petState.coins,
      ownedItems: petState.ownedItems,
      equippedBackground: petState.equippedBackground,
      equippedFurniture: petState.equippedFurniture,
      error: '',
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// POST /api/shop/claim-daily - award the once-per-calendar-day login bonus
router.post('/claim-daily', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const petState = await getOrCreatePetState(userId);
    const today = todayKey();

    if (petState.lastLoginBonusDate === today) {
      return res.status(200).json({ awarded: false, coins: petState.coins, error: '' });
    }

    petState.coins += DAILY_LOGIN_BONUS;
    petState.lastLoginBonusDate = today;
    await petState.save();

    res.status(200).json({
      awarded: true,
      coinsAwarded: DAILY_LOGIN_BONUS,
      coins: petState.coins,
      error: '',
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// POST /api/shop/purchase - buy an item with coins
router.post('/purchase', async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) {
      return res.status(400).json({ error: 'userId and itemId are required' });
    }

    const item = SHOP_ITEMS_BY_ID.get(itemId);
    if (!item) return res.status(404).json({ error: 'Unknown item' });

    const petState = await getOrCreatePetState(userId);

    if (petState.ownedItems.includes(itemId)) {
      return res.status(400).json({ error: 'Already owned' });
    }
    if (petState.coins < item.price) {
      return res.status(400).json({ error: 'Not enough coins' });
    }

    petState.coins -= item.price;
    petState.ownedItems.push(itemId);
    await petState.save();

    res.status(200).json({ coins: petState.coins, ownedItems: petState.ownedItems, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// POST /api/shop/equip - set the background (single slot) or toggle a
// furniture piece on/off (multiple allowed at once)
router.post('/equip', async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) {
      return res.status(400).json({ error: 'userId and itemId are required' });
    }

    const item = SHOP_ITEMS_BY_ID.get(itemId);
    if (!item) return res.status(404).json({ error: 'Unknown item' });

    const petState = await getOrCreatePetState(userId);
    if (item.price > 0 && !petState.ownedItems.includes(itemId)) {
      return res.status(400).json({ error: 'Item not owned' });
    }

    if (item.type === 'background') {
      petState.equippedBackground = itemId;
    } else {
      const idx = petState.equippedFurniture.indexOf(itemId);
      if (idx === -1) {
        petState.equippedFurniture.push(itemId);
      } else {
        petState.equippedFurniture.splice(idx, 1);
      }
    }

    await petState.save();

    res.status(200).json({
      equippedBackground: petState.equippedBackground,
      equippedFurniture: petState.equippedFurniture,
      error: '',
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
