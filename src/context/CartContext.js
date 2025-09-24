// src/context/CartContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import axios from 'axios';
import qs from 'qs';
import { useAuth } from './AuthContext';

const API_BASE = 'https://thenewspotent.com/manage/api';
const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);

  // Guards to avoid StrictMode double-effects & re-sync loops
  const hydratedRef = useRef(false);          // first hydration run
  const loginSyncRef = useRef(null);          // track last user.id we synced for
  const fetchingRef = useRef(false);          // avoid overlapping fetches

  /* --- Guest storage (sanitized read/write + dedupe) --- */
  const readGuest = useCallback(() => {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem('guestCart') || '[]');
    } catch {
      raw = [];
    }
    // Normalize & coerce
    const normalized = (Array.isArray(raw) ? raw : []).map(x => ({
      id:    x.productid ?? x.id,
      vid:   x.variantid ?? x.vid ?? null,
      name:  x.name ?? '',
      image: x.image ?? '',
      price: Number(x.price) || 0,
      qty:   Math.max(1, Number(x.qty) || 1),
    }));

    // Deduplicate by id+vid, summing qty
    const byKey = new Map();
    for (const it of normalized) {
      const key = `${it.id}::${it.vid ?? ''}`;
      const prev = byKey.get(key);
      byKey.set(
        key,
        prev ? { ...it, qty: (Number(prev.qty) || 0) + (Number(it.qty) || 0) } : it
      );
    }
    return Array.from(byKey.values());
  }, []);

  const writeGuest = useCallback((arr) => {
    const safe = (Array.isArray(arr) ? arr : []).map(i => ({
      id:    i.id,
      vid:   i.vid ?? i.variantid ?? null,
      name:  i.name ?? '',
      image: i.image ?? '',
      price: Number(i.price) || 0,
      qty:   Math.max(1, Number(i.qty) || 1),
    }));
    localStorage.setItem('guestCart', JSON.stringify(safe));
  }, []);

  /* --- Normalize each item for UI --- */
  const normalize = (i) => ({
    cartid:    i.cartid ?? i.id,                  // server may send cartid
    id:        i.productid ?? i.id,
    variantid: i.variantid ?? i.vid ?? null,      // unify to variantid for UI
    name:      i.name ?? '',
    image:     i.image ?? '',
    price:     Number(i.price) || 0,
    qty:       Math.max(1, Number(i.qty) || 1),
  });

  /* --- Fetch cart (server if logged in, else guest) --- */
  const fetchCart = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      if (!token || !user) {
        const guest = readGuest();
        setItems(guest.map(normalize)); // REPLACE state (no merge)
        return;
      }

      const { data } = await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({ userid: user.id }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const server = Array.isArray(data?.data) ? data.data : [];
      setItems(server.map(normalize)); // REPLACE state (no merge)

      // IMPORTANT: do NOT mirror server → localStorage here
      // (that caused guest->server re-sync duplication on reload)
    } catch {
      setItems([]);
    } finally {
      fetchingRef.current = false;
    }
  }, [user, token, readGuest]);

  /* --- Sync guest items after login (explicit, idempotent) --- */
  const syncGuestToServer = useCallback(
    async (list = readGuest()) => {
      if (!user || !token || !list.length) return;
      await Promise.all(
        list.map(it => {
          const vid = it.variantid ?? it.vid ?? null;
          return axios
            .post(
              `${API_BASE}/cart`,
              qs.stringify({
                userid:     user.id,
                productid:  it.id,
                variantid:  vid,
                qty:        Math.max(1, Number(it.qty) || 1),
              }),
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              }
            )
            .catch(err =>
              console.error('Sync failed for', it.id, vid, err)
            );
        })
      );
    },
    [user, token, readGuest]
  );

  /* --- Ensure server cart not empty (for checkout/login) --- */
  const ensureServerCartNotEmpty = useCallback(async () => {
    if (!user || !token) return;
    const { data } = await axios.post(
      `${API_BASE}/cart`,
      qs.stringify({ userid: user.id }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const server = Array.isArray(data?.data) ? data.data : [];
    if (!server.length) {
      const guest = readGuest();
      if (guest.length) {
        await syncGuestToServer(guest);
      }
    }
  }, [user, token, readGuest, syncGuestToServer]);

  /* --- Clear --- */
  const clear = useCallback(() => {
    localStorage.removeItem('guestCart');
    setItems([]);
  }, []);

  /* --- Effects: Idempotent hydration & login-sync --- */

  // Initial hydration (runs once even in StrictMode)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    fetchCart();
  }, [fetchCart]);

  // On login, ensure server has items exactly once per user.id
  useEffect(() => {
    if (!user || !token) return;
    if (loginSyncRef.current === user.id) return; // already synced for this user
    loginSyncRef.current = user.id;

    (async () => {
      await ensureServerCartNotEmpty();
      await fetchCart();
    })();
  }, [user, token, ensureServerCartNotEmpty, fetchCart]);

  // On logout → swap back to guest cart snapshot
  useEffect(() => {
    if (user && token) return;
    setItems(readGuest().map(normalize));
  }, [user, token, readGuest]);

  /* --- inc / dec / remove (server vs guest paths) --- */
  const inc = useCallback(async (cartid, id, variantid) => {
    if (token && user) {
      await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({ userid: user.id, productid: id, variantid, qty: 1 }),
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      await fetchCart();
    } else {
      const raw = readGuest();
      const idx = raw.findIndex(x => x.id === id && (x.vid ?? x.variantid) === variantid);
      if (idx > -1) {
        raw[idx].qty = Math.max(1, (Number(raw[idx].qty) || 0) + 1);
      } else {
        raw.push({ id, vid: variantid ?? null, qty: 1, price: 0, name: '', image: '' });
      }
      writeGuest(raw);
      setItems(raw.map(normalize));
    }
  }, [user, token, fetchCart, readGuest, writeGuest]);

  const dec = useCallback(async (cartid, id, variantid) => {
    if (token && user) {
      await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({ userid: user.id, productid: id, variantid, qty: -1 }),
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      await fetchCart();
    } else {
      const raw = readGuest();
      const idx = raw.findIndex(x => x.id === id && (x.vid ?? x.variantid) === variantid);
      if (idx > -1) {
        raw[idx].qty = Math.max(1, (Number(raw[idx].qty) || 1) - 1);
        writeGuest(raw);
        setItems(raw.map(normalize));
      }
    }
  }, [user, token, fetchCart, readGuest, writeGuest]);

  const remove = useCallback(async (cartid, id, variantid) => {
    if (token && user && cartid) {
      await axios.post(
        `${API_BASE}/delete-cart`,
        qs.stringify({ userid: user.id, cartid, variantid }),
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      await fetchCart();
    } else {
      const raw = readGuest().filter(x => !(x.id === id && (x.vid ?? x.variantid) === variantid));
      writeGuest(raw);
      setItems(raw.map(normalize));
    }
  }, [user, token, fetchCart, readGuest, writeGuest]);

  return (
    <CartContext.Provider value={{
      items,
      inc,
      dec,
      remove,
      refresh: fetchCart,
      readGuest,
      syncGuestToServer,
      ensureServerCartNotEmpty,
      clear,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
