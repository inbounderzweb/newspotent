// src/components/ProductList.js
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import ValidateOnLoad from '../../components/ValidateOnLoad';

import { useGetProductsQuery } from '../../features/product/productApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Spinner from '../../components/loader/Spinner';

const API_BASE = 'https://thenewspotent.com/manage/api';

// --- validate key helpers ---
const VALIDATE_KEY_STORAGE = 'validate_key';
const getStoredValidateKey = () => {
  try { return localStorage.getItem(VALIDATE_KEY_STORAGE) || ''; } catch { return ''; }
};
const getEnvValidateKey = () => {
  const vite = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_VALIDATE_KEY) || undefined;
  const cra  = (typeof process !== 'undefined' && process?.env?.REACT_APP_VALIDATE_KEY) || undefined;
  return vite || cra || '';
};
const getValidateKey = () => getStoredValidateKey() || getEnvValidateKey() || '';

// Slugify and include id
const slugify = (s='') =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const buildProductPath = (product) => {
  const slug = product?.slug || product?.seo_slug || slugify(product?.name || '');
  const safeSlug = slug ? `${slug}-${product.id}` : String(product.id);
  return `/product/${safeSlug}`;
};

// ----------------- Guest cart helpers (match CartContext) -----------------
const stableKey = (id, variantid) => `${String(id)}::${String(variantid ?? '')}`;

const readGuest = () => {
  let raw = [];
  try { raw = JSON.parse(localStorage.getItem('guestCart') || '[]'); } catch {}
  const normalized = (Array.isArray(raw) ? raw : []).map(x => ({
    id:    x.productid ?? x.id,
    vid:   x.variantid ?? x.vid ?? null,
    name:  x.name ?? '',
    image: x.image ?? '',
    price: Number(x.price) || 0,
    qty:   Math.max(1, Number(x.qty) || 1),
  }));
  const byKey = new Map();
  for (const it of normalized) {
    const key = stableKey(it.id, it.vid);
    const prev = byKey.get(key);
    byKey.set(key, prev ? { ...it, qty: (Number(prev.qty) || 0) + (Number(it.qty) || 0) } : it);
  }
  return Array.from(byKey.values());
};

const writeGuest = (arr) => {
  const safe = (Array.isArray(arr) ? arr : []).map(i => ({
    id:    i.id,
    vid:   i.vid ?? i.variantid ?? null,
    name:  i.name ?? '',
    image: i.image ?? '',
    price: Number(i.price) || 0,
    qty:   Math.max(1, Number(i.qty) || 1),
  }));
  localStorage.setItem('guestCart', JSON.stringify(safe));
};

export default function ProductList() {
  const navigate = useNavigate();
  const { user, token, isTokenReady } = useAuth();
  const { refresh, drainGuestToServer } = useCart();

  // If user logs in while on this page and guest has items, merge once.
  useEffect(() => {
    if (user && token && readGuest().length) {
      drainGuestToServer();
    }
  }, [user, token, drainGuestToServer]);

  // Fire the products request—but only after token readiness
  const { data, isLoading, isError, refetch } =
    useGetProductsQuery(undefined, { skip: !isTokenReady });

  useEffect(() => { if (isTokenReady) refetch(); }, [isTokenReady, refetch]);

  const products = data?.data || [];

  // ---- Best Sellers only (no filter UI) ----
  const isBestSeller = (p) => {
    const tagHit =
      Array.isArray(p.tags) &&
      p.tags.some(t => String(t).toLowerCase().includes('best'));
    const catHit = String(p.category_name || '').toLowerCase().includes('best');
    return Boolean(
      p.is_bestseller || p.best_seller || p.bestseller || p.isBestSeller || p.bestSeller || tagHit || catHit
    );
  };

  const bestSellers = useMemo(() => {
    const picks = products.filter(isBestSeller);
    return picks.length ? picks : products.slice(0, 8);
  }, [products]);

  const saveGuestCart = product => {
    const current = readGuest();
    const variant = product.variants?.[0] || {};
    const vid     = variant.vid ?? null;
    const price   = Number(variant.sale_price || variant.price || 0) || 0;

    const key = stableKey(product.id, vid);
    const idx = current.findIndex(i => stableKey(i.id, i.vid) === key);
    if (idx > -1) current[idx].qty = (Number(current[idx].qty) || 0) + 1;
    else {
      current.push({
        id:    product.id,
        vid,
        name:  product.name ?? '',
        image: product.image ?? '',
        price,
        qty:   1,
      });
    }
    writeGuest(current);
    refresh(); // update drawer
  };

  const handleAddToCart = async product => {
    const variant = product.variants?.[0] || {};
    const vid = String(variant.vid ?? '');

    // Guest path
    if (!token || !user) {
      saveGuestCart(product);
      alert(`${product.name} added to cart (guest)`);
      return;
    }

    // Logged-in path
    try {
      const { data: resp } = await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({ userid: user.id, productid: product.id, variantid: vid, qty: 1 }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (resp?.success || resp?.status === true) {
        // If there are leftover guest items, merge them now (idempotent)
        if (readGuest().length) await drainGuestToServer();
        await refresh();
        alert(`${product.name} added to cart`);
      } else {
        alert(resp?.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error?.response?.data || error);
      alert('Error adding to cart. Check console.');
    }
  };

  // Build deep link with ?k= and optional ?vid=
  const goToDetails = (product) => {
    const path = buildProductPath(product);
    const variant = product.variants?.[0] || {};
    const vidPart = variant?.vid ? `&vid=${encodeURIComponent(variant.vid)}` : '';
    const key = getValidateKey();
    const q = key ? `?k=${encodeURIComponent(key)}${vidPart}` : (vidPart ? `?${vidPart.slice(1)}` : '');
    navigate(`${path}${q}`, { state: { product, vid: variant?.vid } });
  };

  if (isLoading) return <p className="text-center py-8"><Spinner/></p>;
  if (isError)   return <p className="text-center py-8">Error loading products..</p>;

  return (
    <>
      <ValidateOnLoad />

      <div className='font-[manrope] text-[#256795] text-[25px] leading-[120%] tracking-[0.5px] mx-auto w-full text-center my-5'>Products</div>
      <div className='mx-auto w-[80%] lg:w-[50%] text-center text-[#000] text-[manrope] font-[400] pb-5 text-[16px] leading-[170%] tracking-[0.5px]'>
        <span>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</span>
      </div>
      <div className="h-[220px] bg-[#34552B] rounded-[24px] mx-auto w-[90%] md:w-[75%] py-8"></div>

      <section className="mx-auto w-[90%] md:w-[75%] py-8">
        <div className="
            flex flex-row gap-6 overflow-x-auto pb-4
            sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0
          "
        >
          {bestSellers.map(product => {
            const variant = product.variants?.[0] || {};
            const vid     = variant.vid ?? null;
            const msrp    = Number(variant.price)      || 0;
            const sale    = Number(variant.sale_price) || msrp;

            return (
              <div
                key={`${product.id}-${vid ?? ''}`}
                className="min-w-[80%] lg:min-w-[60%] sm:min-w-0 relative overflow-hidden rounded-[10px]"
              >
                <div className="p-2 bg-white rounded-[8px] flex flex-col h-full">
                  <img
                    onClick={() => goToDetails(product)}
                    src={`https://thenewspotent.com/manage/assets/uploads/${product.image}`}
                    alt={product.name}
                    className="w-full object-cover cursor-pointer rounded-[8px] h-64"
                  />

                  <div className="pt-4 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-[#2A3443] font-[manrope] text-[16px] leading-[170%] tracking-[0.5px] text-center line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="text-center mt-4">
                      <span className="font-normal leading-[170%] tracking-[0.5px] text-[18px] text-[#2972A5]">
                        ₹{sale}/-
                      </span>
                      <br />
                      <button
                        className="text-center w-full lg:w-[50%] mx-auto justify-center items-center bg-[#2972A5] text-white py-2 rounded-full mt-2"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                      {/* <button
                        className="text-center w-full lg:w-[50%] mx-auto justify-center items-center border border-[#2972A5] text-[#2972A5] py-2 rounded-full mt-2"
                        onClick={() => goToDetails(product)}
                      >
                        View Product
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2 text-[#0E283A] rounded-full border-[1px] border-[#0E283A]"
          >
            View all Products
          </button>
        </div>
      </section>
    </>
  );
}
