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

// Stable string key for consistent matching across types
const stableKey = (id, variantid) => `${String(id)}::${String(variantid ?? '')}`;

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);

  // Guards to avoid StrictMode double-effects & re-sync loops
  const hydratedRef = useRef(false);
  const loginSyncRef = useRef(null);
  const fetchingRef = useRef(false);

  /* -------------------- Guest storage (read/write + dedupe) -------------------- */
  const readGuest = useCallback(() => {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem('guestCart') || '[]');
    } catch {
      raw = [];
    }

    // Normalize to a consistent shape
    const normalized = (Array.isArray(raw) ? raw : []).map(x => ({
      id:    x.productid ?? x.id,
      vid:   x.variantid ?? x.vid ?? null,
      name:  x.name ?? '',
      image: x.image ?? '',
      price: Number(x.price) || 0,
      qty:   Math.max(1, Number(x.qty) || 1),
    }));

    // Deduplicate by (id, vid) accumulating qty
    const byKey = new Map();
    for (const it of normalized) {
      const key = stableKey(it.id, it.vid);
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
      vid:   i.vid ?? i.variantid ?? null, // persist as "vid" consistently
      name:  i.name ?? '',
      image: i.image ?? '',
      price: Number(i.price) || 0,
      qty:   Math.max(1, Number(i.qty) || 1),
    }));
    localStorage.setItem('guestCart', JSON.stringify(safe));
  }, []);

  /* ------------------------- Normalize for UI rendering ------------------------ */
  const normalize = (i) => ({
    cartid:    i.cartid ?? i.id,                 // server may send cartid
    id:        i.productid ?? i.id,
    variantid: i.variantid ?? i.vid ?? null,     // unify to variantid for UI
    name:      i.name ?? '',
    image:     i.image ?? '',
    price:     Number(i.price) || 0,
    qty:       Math.max(1, Number(i.qty) || 1),
  });

  /* --------------------- Server cart fetch (normalized) ------------------------ */
  const fetchCart = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      if (!token || !user) {
        const guest = readGuest();
        setItems(guest.map(normalize));
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
      setItems(server.map(normalize));
    } catch {
      setItems([]);
    } finally {
      fetchingRef.current = false;
    }
  }, [user, token, readGuest]);

  // Helper to fetch server cart (returns normalized array)
  const getServerCart = useCallback(async () => {
    if (!user || !token) return [];
    try {
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
      return server.map(normalize);
    } catch {
      return [];
    }
  }, [user, token]);

  /* -------- Robust guest → server sync (sequential; per-item remove) ---------- */
  // Adds qty from guest to server (merge). Only removes that guest line after success.
  const syncGuestToServer = useCallback(
    async (guestList) => {
      if (!user || !token) return { success: 0, fail: (guestList?.length || 0) };

      const list = Array.isArray(guestList) ? guestList : [];
      let success = 0;
      let fail = 0;

      for (const it of list) {
        const vid = String(it.variantid ?? it.vid ?? ''); // API-friendly
        try {
          await axios.post(
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
          );

          // Remove this line from guest storage snapshot
          const key = stableKey(it.id, it.vid ?? it.variantid);
          const after = readGuest().filter(
            x => stableKey(x.id, x.vid ?? x.variantid) !== key
          );
          writeGuest(after);

          success += 1;
        } catch (err) {
          console.error('Guest→Server sync failed for', it.id, vid, err);
          fail += 1;
          // keep for retry
        }
      }
      return { success, fail };
    },
    [user, token, readGuest, writeGuest]
  );

  /* ------------------ Drain guest → server on login (MERGE) ------------------- */
  const drainGuestToServer = useCallback(async () => {
    if (!user || !token) return;

    const guest = readGuest();
    if (!guest.length) return;

    // We add guest qty on top, regardless of server contents.
    const { success } = await syncGuestToServer(guest);

    // If everything synced, clear leftover guest storage; otherwise keep fails
    if (success > 0) {
      const left = readGuest();
      if (left.length === 0) localStorage.removeItem('guestCart');
      else writeGuest(left);
    }

    // Final refresh so UI shows merged truth
    await fetchCart();
  }, [user, token, readGuest, writeGuest, syncGuestToServer, fetchCart]);

  /* --------------------------------- Clear all -------------------------------- */
  const clear = useCallback(() => {
    localStorage.removeItem('guestCart');
    setItems([]);
  }, []);

  /* -------------------- Effects: hydration & login merge ----------------------- */
  // Initial hydration (runs once even in StrictMode)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    fetchCart();
  }, [fetchCart]);

  // On login, merge guest → server exactly once per user.id, then refresh
  useEffect(() => {
    if (!user || !token) return;
    if (loginSyncRef.current === user.id) return; // already handled for this user
    loginSyncRef.current = user.id;

    (async () => {
      await drainGuestToServer();
      await fetchCart();
    })();
  }, [user, token, drainGuestToServer, fetchCart]);

  // On logout → swap back to guest cart snapshot
  useEffect(() => {
    if (user && token) return;
    setItems(readGuest().map(normalize));
  }, [user, token, readGuest]);

  /* ------------------------- inc / dec / remove actions ------------------------ */
  const inc = useCallback(async (cartid, id, variantid) => {
    if (token && user) {
      await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({ userid: user.id, productid: id, variantid: String(variantid ?? ''), qty: 1 }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      await fetchCart();
    } else {
      const raw = readGuest();
      const key = stableKey(id, variantid);
      const idx = raw.findIndex(x => stableKey(x.id, x.vid ?? x.variantid) === key);
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
        qs.stringify({ userid: user.id, productid: id, variantid: String(variantid ?? ''), qty: -1 }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      await fetchCart();
    } else {
      const raw = readGuest();
      const key = stableKey(id, variantid);
      const idx = raw.findIndex(x => stableKey(x.id, x.vid ?? x.variantid) === key);
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
        qs.stringify({ userid: user.id, cartid, variantid: String(variantid ?? '') }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      await fetchCart();
    } else {
      const key = stableKey(id, variantid);
      const raw = readGuest().filter(
        x => stableKey(x.id, x.vid ?? x.variantid) !== key
      );
      writeGuest(raw);
      setItems(raw.map(normalize));
    }
  }, [user, token, fetchCart, readGuest, writeGuest]);

  /* --------------------------------- Context ---------------------------------- */
  return (
    <CartContext.Provider
      value={{
        items,
        inc,
        dec,
        remove,
        refresh: fetchCart,
        readGuest,
        getServerCart,
        syncGuestToServer,
        drainGuestToServer,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
