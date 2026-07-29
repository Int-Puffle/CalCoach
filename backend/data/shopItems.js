// Catalog - keep hand-tunable. Every id here must have a matching hand-drawn
// SVG on the frontend (PetSceneAssets backgrounds/furniture, or PetCreature's
// BODY_COLORS/hairstyle variants).
const SHOP_ITEMS = [
  { id: 'meadow', type: 'background', name: 'Meadow', price: 0 },
  { id: 'sunset', type: 'background', name: 'Sunset Sky', price: 30 },
  { id: 'night', type: 'background', name: 'Starry Night', price: 50 },
  { id: 'beach', type: 'background', name: 'Beach', price: 40 },
  { id: 'forest', type: 'background', name: 'Forest', price: 45 },
  { id: 'space', type: 'background', name: 'Outer Space', price: 55 },

  { id: 'plant', type: 'furniture', name: 'Potted Plant', price: 20 },
  { id: 'rug', type: 'furniture', name: 'Cozy Rug', price: 15 },
  { id: 'lamp', type: 'furniture', name: 'Little Lamp', price: 25 },
  { id: 'bookshelf', type: 'furniture', name: 'Bookshelf', price: 35 },
  { id: 'trophy', type: 'furniture', name: 'Trophy', price: 30 },
  { id: 'ball', type: 'furniture', name: 'Bouncy Ball', price: 15 },

  { id: 'green', type: 'color', name: 'Classic Green', price: 0 },
  { id: 'blue', type: 'color', name: 'Ocean Blue', price: 35 },
  { id: 'pink', type: 'color', name: 'Blossom Pink', price: 35 },
  { id: 'orange', type: 'color', name: 'Sunset Orange', price: 35 },

  { id: 'default', type: 'hairstyle', name: 'Classic Sprigs', price: 0 },
  { id: 'mohawk', type: 'hairstyle', name: 'Mohawk', price: 30 },
  { id: 'curly', type: 'hairstyle', name: 'Curly Top', price: 30 },
  { id: 'flower', type: 'hairstyle', name: 'Flower Crown', price: 40 },
];

const SHOP_ITEMS_BY_ID = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

module.exports = { SHOP_ITEMS, SHOP_ITEMS_BY_ID };
