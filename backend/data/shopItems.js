// Starter catalog - keep small and hand-tunable. Every id here must have a
// matching hand-drawn SVG on the frontend (PetScene background/furniture maps).
const SHOP_ITEMS = [
  { id: 'meadow', type: 'background', name: 'Meadow', price: 0 },
  { id: 'sunset', type: 'background', name: 'Sunset Sky', price: 30 },
  { id: 'night', type: 'background', name: 'Starry Night', price: 50 },

  { id: 'plant', type: 'furniture', name: 'Potted Plant', price: 20 },
  { id: 'rug', type: 'furniture', name: 'Cozy Rug', price: 15 },
  { id: 'lamp', type: 'furniture', name: 'Little Lamp', price: 25 },
];

const SHOP_ITEMS_BY_ID = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

module.exports = { SHOP_ITEMS, SHOP_ITEMS_BY_ID };
