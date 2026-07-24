import { useEffect, useState } from 'react';
import { API_BASE } from '../config';
import { BACKGROUNDS, FURNITURE } from './PetSceneAssets';
import { useAuth } from '../context/AuthContext';

type ShopTabProps = {
  userId: string;
  onStateChange?: (state: ShopState) => void;
};

type CatalogItem = {
  id: string;
  type: 'background' | 'furniture';
  name: string;
  price: number;
};

type ShopState = {
  coins: number;
  ownedItems: string[];
  equippedBackground: string;
  equippedFurniture: string[];
};

function ItemPreview({ id, type }: { id: string; type: 'background' | 'furniture' }) {
  const asset = type === 'background' ? BACKGROUNDS[id] : FURNITURE[id];
  if (!asset) return null;

  return (
    <svg viewBox="0 0 200 220" className="shop-item-preview">
      {type === 'background' && asset.render()}
      {type === 'furniture' && (
        <>
          {BACKGROUNDS.meadow.render()}
          {asset.render()}
        </>
      )}
    </svg>
  );
}

function ShopTab({ userId, onStateChange }: ShopTabProps) {
  const { refreshUser } = useAuth();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [state, setState] = useState<ShopState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/shop/catalog`).then((res) => res.json()),
      fetch(`${API_BASE}/api/shop/state/${userId}`, { credentials: 'include' }).then((res) => res.json()),
    ])
      .then(([catalogData, stateData]) => {
        setCatalog(catalogData.items || []);
        setState(stateData);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (state) onStateChange?.(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function handleBuy(item: CatalogItem) {
    setPendingItemId(item.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/shop/purchase`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId: item.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
      } else {
        setState((prev) => (prev ? { ...prev, coins: data.coins, ownedItems: data.ownedItems } : prev));
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleEquip(item: CatalogItem) {
    setPendingItemId(item.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/shop/equip`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId: item.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
      } else {
        setState((prev) =>
          prev
            ? { ...prev, equippedBackground: data.equippedBackground, equippedFurniture: data.equippedFurniture }
            : prev
        );
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      'This permanently deletes all your food logs, coins, purchases, and pet progress, and starts you over with a brand-new pet. This cannot be undone. Continue?'
    );
    if (!confirmed) return;

    setResetting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/account/reset`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        setResetting(false);
        return;
      }
      await refreshUser();
    } catch (err) {
      setError(String(err));
      setResetting(false);
    }
  }

  if (loading) return <p className="progress-empty">Loading the shop...</p>;
  if (!state) return <p className="form-message error">{error || 'Could not load the shop.'}</p>;

  const owned = (id: string, price: number) => price === 0 || state.ownedItems.includes(id);

  function renderItem(item: CatalogItem) {
    const isOwned = owned(item.id, item.price);
    const isEquipped =
      item.type === 'background'
        ? state!.equippedBackground === item.id
        : state!.equippedFurniture.includes(item.id);
    const pending = pendingItemId === item.id;
    const canAfford = state!.coins >= item.price;

    return (
      <li key={item.id} className="shop-item-card">
        <ItemPreview id={item.id} type={item.type} />
        <div className="shop-item-name">{item.name}</div>
        {item.price > 0 && <div className="shop-item-price">🪙 {item.price}</div>}

        {isOwned ? (
          <button
            type="button"
            className={`secondary-btn ${isEquipped ? 'is-equipped' : ''}`}
            onClick={() => handleEquip(item)}
            disabled={pending || (item.type === 'background' && isEquipped)}
          >
            {pending ? '...' : isEquipped ? (item.type === 'furniture' ? 'Placed (tap to remove)' : 'Equipped') : 'Equip'}
          </button>
        ) : (
          <button
            type="button"
            className="primary-btn shop-buy-btn"
            onClick={() => handleBuy(item)}
            disabled={pending || !canAfford}
          >
            {pending ? '...' : canAfford ? `Buy for ${item.price}` : `Need ${item.price - state!.coins} more`}
          </button>
        )}
      </li>
    );
  }

  const backgrounds = catalog.filter((i) => i.type === 'background');
  const furniture = catalog.filter((i) => i.type === 'furniture');

  return (
    <div className="shop-tab">
      <div className="shop-header">
        <h2>Shop</h2>
        <div className="coin-badge">🪙 {state.coins} coins</div>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <h3 className="shop-section-title">Backgrounds</h3>
      <ul className="shop-grid">{backgrounds.map(renderItem)}</ul>

      <h3 className="shop-section-title">Furniture</h3>
      <ul className="shop-grid">{furniture.map(renderItem)}</ul>

      <div className="danger-zone">
        <h3 className="shop-section-title">Danger zone</h3>
        <p className="danger-zone-copy">
          Want to start over with a different CalCoach pet? This wipes all your food logs, coins, purchases, and
          personalization data.
        </p>
        <button type="button" className="danger-btn" onClick={handleReset} disabled={resetting}>
          {resetting ? 'Resetting...' : 'Reset my pet'}
        </button>
      </div>
    </div>
  );
}

export default ShopTab;
