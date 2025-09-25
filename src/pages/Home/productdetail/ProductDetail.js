// src/pages/product-details/ProductDetails.js
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import {
  StarIcon as StarSolid,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import ValidateOnLoad from '../../../components/ValidateOnLoad';
import DiscoverMore from './DiscoverMore';
// import OwnPerfume from '../../../components/ownperfume/OwnPerfume';
// import SpecialDealsSlider from '../../../components/SpecialDealsSlider/SpecialDealsSlider';

const API_BASE = 'https://thenewspotent.com/manage/api';
const VALIDATE_URL = 'https://thenewspotent.com/manage/api/validate';
const AUTH_EMAIL = 'api@thenewspotent.com';
const AUTH_PASSWORD = 'r42clmPq@BZAQ9Gs';

/* --------------------------- validate-key helpers --------------------------- */
const VALIDATE_KEY_STORAGE = 'validate_key';
const getStoredValidateKey = () => {
  try { return localStorage.getItem(VALIDATE_KEY_STORAGE) || ''; } catch { return ''; }
};
const persistValidateKey = (k) => { try { if (k) localStorage.setItem(VALIDATE_KEY_STORAGE, k); } catch {} };
const resolveValidateKey = (sp) => {
  const fromQ = sp.get('k') || '';
  if (fromQ) persistValidateKey(fromQ);
  return fromQ || getStoredValidateKey() || '';
};
const makeHeaders = (token, vKey) => {
  const h = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (token) h.Authorization = `Bearer ${token}`;
  if (vKey)  h['x-validate-key'] = vKey;
  return h;
};

/* ------------------------------ slug/id helpers ----------------------------- */
const ID_AT_END = /-(\d+)$/;
const isNumericId = (s) => /^\d+$/.test(String(s || ''));
const getIdFromSlug = (s) => {
  const m = String(s || '').match(ID_AT_END);
  return m ? Number(m[1]) : null;
};
const slugify = (s='') =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ------------------------------ guest cart utils ---------------------------- */
const readGuest = () => {
  const raw = JSON.parse(localStorage.getItem('guestCart') || '[]');
  const norm = (Array.isArray(raw) ? raw : []).map(x => ({
    id: x.productid ?? x.id,
    vid: x.variantid ?? x.vid,
    name: x.name,
    image: x.image,
    price: Number(x.price) || 0,
    qty: Number(x.qty) || 1,
  }));
  const map = new Map();
  for (const it of norm) {
    const k = `${it.id}::${it.vid}`;
    const prev = map.get(k);
    map.set(k, prev ? { ...it, qty: (Number(prev.qty) || 0) + (Number(it.qty) || 0) } : it);
  }
  return Array.from(map.values());
};
const writeGuest = (arr) => {
  const safe = (Array.isArray(arr) ? arr : []).map(i => ({
    id: i.id,
    vid: i.vid ?? i.variantid,
    name: i.name,
    image: i.image,
    price: Number(i.price) || 0,
    qty: Number(i.qty) || 1,
  }));
  localStorage.setItem('guestCart', JSON.stringify(safe));
};

/* ================================= Component ================================ */
export default function ProductDetails() {
  const navigate = useNavigate();
  const { slugOrId } = useParams();
  const [sp, setSp] = useSearchParams();

  const { user, token, setToken } = useAuth();
  const { refresh } = useCart();

  // capture & persist validate key; read optional ?vid
  const validateKey = resolveValidateKey(sp);
  const initialVid = sp.get('vid') || undefined;

  // numeric id (123) or slug-with-id (something-123)
  const idFromUrl = isNumericId(slugOrId) ? Number(slugOrId) : (getIdFromSlug(slugOrId) || null);

  const [product, setProduct] = useState(null);
  const [selectedVar, setSelectedVar] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ----------------------- ensure token before API calls --------------------- */
  const fetchTokenIfNeeded = async () => {
    // 1) context
    if (token) return token;

    // 2) localStorage (valid for <= 24h)
    const saved = localStorage.getItem('authToken');
    const time = localStorage.getItem('authTokenTime');
    const fresh = saved && time && (Date.now() - parseInt(time, 10) < 86400000);
    if (fresh) {
      if (typeof setToken === 'function') setToken(saved);
      return saved;
    }

    // 3) get a new one (same as your ValidateOnLoad)
    try {
      const { data } = await axios.post(
        VALIDATE_URL,
        qs.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const t = data?.token;
      if (t) {
        localStorage.setItem('authToken', t);
        localStorage.setItem('authTokenTime', Date.now().toString());
        if (typeof setToken === 'function') setToken(t);
        return t;
      }
    } catch (err) {
      console.error('❌ Token fetch failed:', err?.response?.data || err.message);
    }
    return null;
  };

  // proactively ensure token on mount (ValidateOnLoad also runs a timer refresh)
  useEffect(() => { (async () => { await fetchTokenIfNeeded(); })(); /* eslint-disable-next-line */ }, []);

  /* -------------------------------- fetch product --------------------------- */
  useEffect(() => {
    let cancelled = false;
    if (!slugOrId) return;

    (async () => {
      setLoading(true);
      setError('');

      const authTok = await fetchTokenIfNeeded();
      const headers = makeHeaders(authTok || token, validateKey);

      try {
        let fetched = null;

        if (idFromUrl) {
          const url = `${API_BASE}/products/${idFromUrl}${initialVid ? `?vid=${encodeURIComponent(initialVid)}` : ''}`;
          const { data } = await axios.get(url, { headers });
          fetched = data?.data || data || null;
        } else {
          // best-effort slug endpoint (if backend supports it)
          try {
            const slugUrl = `${API_BASE}/products/slug/${encodeURIComponent(slugOrId)}`;
            const { data } = await axios.get(slugUrl, { headers });
            fetched = data?.data || data || null;
          } catch {
            fetched = null;
          }
        }

        if (!cancelled) {
          if (fetched && fetched.id) setProduct(fetched);
          else setError('Product not found.');
        }
      } catch (e) {
        console.error('Product fetch error:', e);
        if (!cancelled) setError('Unable to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugOrId, idFromUrl, initialVid, validateKey]);

  /* -------------------------------- gallery --------------------------------- */
  const images = useMemo(() => {
    if (!product) return [];
    const pics = [];
    if (product.image) pics.push(product.image);
    if (product.more_images) {
      const extras = Array.isArray(product.more_images)
        ? product.more_images
        : String(product.more_images).split(',').map(s => s.trim()).filter(Boolean);
      for (const img of extras) if (!pics.includes(img)) pics.push(img);
    }
    return pics;
  }, [product]);

  useEffect(() => { if (images.length) setActiveImg(images[0]); }, [images]);

  const nextImg = () => {
    if (!images.length) return;
    const i = images.indexOf(activeImg);
    setActiveImg(images[(i + 1) % images.length]);
  };
  const prevImg = () => {
    if (!images.length) return;
    const i = images.indexOf(activeImg);
    setActiveImg(images[(i - 1 + images.length) % images.length]);
  };

  /* ------------------------------- variants ---------------------------------- */
  const variantOptions = useMemo(
    () =>
      (product?.variants || []).map(v => ({
        vid: v.vid,
        label: v.weight ? `${v.weight} ml` : v.label || '',
        price: Number(v.price) || 0,
        sale_price: Number(v.sale_price) || 0,
      })),
    [product]
  );

  useEffect(() => {
    if (!variantOptions.length) return;
    if (initialVid) {
      const found = variantOptions.find(v => String(v.vid) === String(initialVid));
      setSelectedVar(found || variantOptions[0]);
    } else {
      const first = variantOptions[0];
      setSelectedVar(first);
      // normalize URL to contain ?vid= for shareability
      setSp(prev => {
        const p = new URLSearchParams(prev);
        p.set('vid', first.vid);
        return p;
      }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantOptions, initialVid]);

  /* -------------------------------- pricing ---------------------------------- */
  const unitPrice =
    selectedVar?.sale_price && selectedVar.sale_price < selectedVar.price
      ? selectedVar.sale_price
      : selectedVar?.price || 0;
  const totalPrice = (unitPrice || 0) * qty;

  /* ------------------------------ cart handlers ------------------------------ */
  const addGuest = () => {
    const current = readGuest();
    const idx = current.findIndex(i => String(i.id) === String(product.id) && String(i.vid) === String(selectedVar.vid));
    if (idx > -1) current[idx].qty += qty;
    else current.push({
      id: product.id,
      vid: selectedVar.vid,
      name: product.name,
      image: product.image,
      price: unitPrice,
      qty,
    });
    writeGuest(current);
    alert(`${product.name} added to cart (guest)`);
  };

  const addServer = async () => {
    const authTok = await fetchTokenIfNeeded();
    const headers = makeHeaders(authTok || token, validateKey);
    return axios.post(
      `${API_BASE}/cart`,
      qs.stringify({ userid: user.id, productid: product.id, variantid: selectedVar.vid, qty }),
      { headers }
    );
  };

  const handleAddToCart = async () => {
    if (!selectedVar?.vid || !product?.id) return;
    if (!user || !token) return addGuest();
    try {
      await addServer();
      await refresh();
      alert(`${product.name} added to cart`);
    } catch {
      alert('Error adding to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVar?.vid || !product?.id) return;
    if (!user || !token) {
      addGuest();
      return navigate('/checkout');
    }
    try {
      await addServer();
      await refresh();
      navigate('/checkout');
    } catch {
      alert('Error proceeding to checkout');
    }
  };

  /* -------------------------------- share url -------------------------------- */
  const handleShare = async () => {
    const slug = product?.slug || product?.seo_slug || slugify(product?.name || '');
    const path = `/product/${slug ? `${slug}-${product.id}` : product.id}`;
    const vidPart = selectedVar?.vid ? `&vid=${encodeURIComponent(selectedVar.vid)}` : '';
    const keyPart = validateKey ? `?k=${encodeURIComponent(validateKey)}${vidPart}` : (vidPart ? `?${vidPart.slice(1)}` : '');
    const url = `${window.location.origin}${path}${keyPart}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name || 'Product', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied!');
      }
    } catch {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  /* --------------------------------- render ---------------------------------- */
  if (loading) return <p className="p-6 text-center">Loading…</p>;
  if (error || !product) {
    return (
      <div className="p-6">
        {error || 'Product not found.'}&nbsp;
        <Link to="/shop" className="underline text-blue-600">Back to Shop</Link>
      </div>
    );
  }

  const heroSubtitle =
    product?.short_description ||
    'We believe Colours are in the mind—so we made this book in Black and White';

  const subTitleBlock =
    product?.subtitle ||
    'Helping Students Step Beyond the Classroom—The Smartest Student Companion for Quick News, Knowledge, and Confidence!';

  return (
    <div className="w-full bg-white">
      {/* 🔐 keep your background token protection/checks running */}
      <ValidateOnLoad />

      <div className="w-full px-2 lg:px-20">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#0E283A]/70 mb-4 md:mb-6">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:underline">Products</Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* LEFT: Gallery */}
          <div>
            <div className="w-full aspect-square rounded-[22px] flex items-center justify-center lg:justify-start overflow-hidden">
              {activeImg ? (
                <img
                  src={`https://thenewspotent.com/manage/assets/uploads/${activeImg}`}
                  alt={product.name}
                  className="w-[88%] h-[88%] object-contain"
                />
              ) : (
                <div className="text-white/70 text-sm">No Image</div>
              )}
            </div>

            {/* Thumbs */}
            <div className="mt-4 flex items-center gap-3">
              <button onClick={prevImg} className="h-6 w-6 rounded-full bg-white/60 flex items-center justify-center" aria-label="Prev">
                <ChevronLeftIcon className="h-4 w-4 text-[#0E283A]" />
              </button>

              <div className="flex gap-3">
                {(images.length ? images : [activeImg]).slice(0, 3).map((img) => (
                  <button
                    key={img || 'placeholder'}
                    onClick={() => img && setActiveImg(img)}
                    className={`h-20 w-20 rounded-xl overflow-hidden border transition bg-white/60 ${
                      img && img === activeImg ? 'border-[#2972A5]' : 'border-[#BFD2E1]'
                    }`}
                  >
                    {img ? (
                      <img
                        src={`https://thenewspotent.com/manage/assets/uploads/${img}`}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : <div className="h-full w-full" />}
                  </button>
                ))}
              </div>

              <button onClick={nextImg} className="h-6 w-6 rounded-full bg-white/60 flex items-center justify-center" aria-label="Next">
                <ChevronRightIcon className="h-4 w-4 text-[#0E283A]" />
              </button>
            </div>
          </div>

            {/* RIGHT: Details */}
            <div className="flex flex-col">
              {/* Eyebrow + Share */}
              <div className="flex items-start justify-between">
                <div className="text-[#2972A5] text-sm">1st Edition</div>
                <button className="p-2 rounded-full hover:bg-white/50" aria-label="Share" onClick={handleShare}>
                  <ShareIcon className="h-5 w-5 text-[#0E283A]" />
                </button>
              </div>

              <h1 className="mt-1 text-[#215B84] text-[manrope] text-[31px] md:text-[34px] font-[700] leading-[125%]">
                {product.name || 'Product'}
              </h1>

              <p className="mt-1 text-[#0E283A] text-[manrope] text-[16px] leading-[150%] tracking-[0.5px] font-[400]">
                {heroSubtitle}
              </p>

              {/* Rating row */}
              <div className="mt-3 flex items-center gap-4 text-[#0E283A]/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#C9D6E2] px-2 py-1 text-sm">
                  <span className="inline-flex">
                    {Array.from({ length: 1 }).map((_, i) => (
                      <StarSolid key={i} className="h-4 w-4 text-[#2972A5]" />
                    ))}
                  </span>
                  4.8
                </span>
                <span className="text-sm">67 Reviews</span>
                <span className="text-sm">93% of buyers have recommended this.</span>
              </div>

              <div className="mt-5 rounded-[12px] border border-[#C9D6E2] bg-white/50 p-4 md:p-5">
                <div className="mt-4 flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-[#0E283A]/90 leading-[150%]">
                      {subTitleBlock}
                    </div>

                    {/* Qty + Add */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center justify-between border border-[#C9D6E2] rounded-full h-12 w-[140px] bg-white">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty === 1}
                          className="px-4 py-2 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-5 w-5 text-[#0E283A]" />
                        </button>
                        <span className="min-w-[2rem] text-center text-[#0E283A]">{qty}</span>
                        <button
                          onClick={() => setQty((q) => q + 1)}
                          className="px-4 py-2"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-5 w-5 text-[#0E283A]" />
                        </button>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className="h-12 px-6 rounded-full bg-[#2972A5] text-white font-medium hover:opacity-95"
                      >
                        Add To Cart
                      </button>
                    </div>

                    <button
                      onClick={handleBuyNow}
                      className="mt-4 w-[260px] h-12 rounded-full bg-[#0E283A] text-white font-semibold hover:opacity-95"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* delivery card */}
                  <div className="w-full lg:w-[260px] rounded-[10px] border border-[#C9D6E2] bg-white/60 p-4">
                    <div className="space-y-4 text-sm text-[#0E283A]">
                      <div>
                        <div className="font-semibold">Free Delivery</div>
                        <div className="text-[#0E283A]/70">Enter your Postal code for Delivery Availability</div>
                      </div>
                      <div>
                        <div className="font-semibold">Return Delivery</div>
                        <div className="text-[#0E283A]/70">
                          Free 30 days Delivery Return. <span className="underline">Details</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* sr total */}
                <div className="sr-only">₹{totalPrice.toFixed(0)}/-</div>
              </div>

              <div className="mt-6 divide-y divide-[#C9D6E2] rounded-[8px] bg-transparent" />
            </div>
        </div>

        <hr className="border-[#C9D6E2] mt-8 w-full" />

        {/* Discover more */}
        <DiscoverMore currentId={product.id} />
        {/* <SpecialDealsSlider /> */}
        {/* <OwnPerfume /> */}
      </div>
    </div>
  );
}