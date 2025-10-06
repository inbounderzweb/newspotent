// src/pages/shop/Shop.js
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import bag from '../../../assets/bag.svg';
import shopherobg from '../../../assets/shopherobg.svg';
import shopherobgmob from '../../../assets/shopheromobbg.svg';
import SpecialDealsSlider from '../../../components/SpecialDealsSlider/SpecialDealsSlider';
import OwnPerfume from '../../../components/ownperfume/OwnPerfume';
import { useGetProductsQuery } from '../../../features/product/productApi';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import galleryico from '../../../assets/gallery.svg';
const API_BASE = 'https://thenewspotent.com/manage/api';

// --- validate key helpers ---
const VALIDATE_KEY_STORAGE = 'validate_key';
const getStoredValidateKey = () => {
  try { return localStorage.getItem(VALIDATE_KEY_STORAGE) || ''; } catch { return ''; }}


const getEnvValidateKey = () => {
  const vite = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_VALIDATE_KEY) || undefined;
  const cra  = (typeof process !== 'undefined' && process?.env?.REACT_APP_VALIDATE_KEY) || undefined;
  return vite || cra || '';
};



const getValidateKey = () => getStoredValidateKey() || getEnvValidateKey() || '';

/* ----------------------------- Guest Cart Utils ---------------------------- */
const readGuest = () => {
  const raw = JSON.parse(localStorage.getItem('guestCart') || '[]');
  return (Array.isArray(raw) ? raw : []).map((x) => ({
    id: x.productid ?? x.id,
    vid: x.variantid ?? x.vid,
    name: x.name,
    image: x.image,
    price: Number(x.price) || 0,
    qty: Number(x.qty) || 1,
  }));
};
const writeGuest = (arr) =>
  localStorage.setItem('guestCart', JSON.stringify(arr));

async function syncGuestCartWithServer(userId, token) {
  const resp = await axios.post(
    `${API_BASE}/cart`,
    qs.stringify({ userid: userId }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  const items = resp.data?.data || [];
  writeGuest(
    items.map((i) => ({
      id: i.id,
      vid: i.variantid ?? i.vid,
      name: i.name,
      image: i.image,
      price: Number(i.price) || 0,
      qty: Number(i.qty) || 1,
    }))
  );
}


/* -------------------------------------------------------------------------- */

export default function Shop() {
  const { data, isLoading, isError } = useGetProductsQuery();
  const products = useMemo(() => data?.data || [], [data]);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { refresh } = useCart();

  // Build filters dynamically from API categories
  const categories = useMemo(
    () => ['All Products', ...new Set(products.map((p) => p.category_name))],
    [products]
  );
  const [selectedFilter, setSelectedFilter] = useState('All Products');

  // Apply filter
  const filtered =
    selectedFilter === 'All Products'
      ? products
      : products.filter((p) => p.category_name === selectedFilter);

  // Add to cart
  const saveGuestCart = (product) => {
    const current = readGuest();
    const variant = product.variants?.[0] || {};
    const vid = variant.vid;
    const price = Number(variant.sale_price || variant.price || 0) || 0;
    const idx = current.findIndex((i) => i.id === product.id && i.vid === vid);
    if (idx > -1) current[idx].qty = (Number(current[idx].qty) || 0) + 1;
    else
      current.push({
        id: product.id,
        vid,
        name: product.name,
        image: product.image,
        price,
        qty: 1,
      });
    writeGuest(current);
    alert(`${product.name} added to cart (guest)`);
    refresh();
  };

  const handleAddToCart = async (product) => {
    const variant = product.variants?.[0] || {};
    if (!token || !user) return saveGuestCart(product);
    try {
      const { data: resp } = await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({
          userid: user.id,
          productid: product.id,
          variantid: variant.vid,
          qty: 1,
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (resp?.success) {
        alert(`${product.name} added to cart`);
        await syncGuestCartWithServer(user.id, token);
        refresh();
      } else alert(resp?.message || 'Failed to add to cart');
    } catch (e) {
      console.error(e);
      alert('Error adding to cart');
    }
  };





// Slugify and include id
const slugify = (s='') =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const buildProductPath = (product) => {
  const slug = product?.slug || product?.seo_slug || slugify(product?.name || '');
  const safeSlug = slug ? `${slug}-${product.id}` : String(product.id);
  return `/product/${safeSlug}`;
};


// Build deep link with ?k= and optional ?vid=
  const goToDetails = (p) => {
  
    const path = buildProductPath(p);
    const variant = p.variants?.[0] || {};
    const vidPart = variant?.vid ? `&vid=${encodeURIComponent(variant.vid)}` : '';
    const key = getValidateKey();
    const q = key ? `?k=${encodeURIComponent(key)}${vidPart}` : (vidPart ? `?${vidPart.slice(1)}` : '');
    navigate(`${path}${q}`, { state: { p, vid: variant?.vid } });
  };









  const handleViewDetails = (product) => {
    const variant = product.variants?.[0] || {};
    navigate('/product-details', { state: { product, vid: variant.vid } });
  };

  if (isLoading) return <p className="text-center py-20">Loading…</p>;
  if (isError) return <p className="text-center py-20">Something went wrong.</p>;

  return (
    <div className="w-full bg-[#E6EEF5] py-8">
      <div className="mx-auto w-[95%] md:w-[90%] xl:w-[1200px] grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar filters */}
        <aside className="bg-white/60 rounded-[10px] p-4">
          <h3 className="font-semibold text-[#0E283A] mb-4">Filters</h3>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="filter"
                    value={cat}
                    checked={selectedFilter === cat}
                    onChange={() => setSelectedFilter(cat)}
                    className="accent-[#2972A5]"
                  />
                  <span className="text-[#0E283A]/90">{cat}</span>
                </label>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div>
          {/* Hero info box */}
          <div className="w-full h-[220px] rounded-[10px] bg-[#194463] text-white flex items-center p-6 mb-8">


         <div className='grid grid-cols-1 lg:flex w-[100%] lg:w-[50%] items-center mx-auto gap-5 justify-between'>
            <img src={galleryico} alt='gallery-icon'/>
            <p className='font-[manrope] text-[13px] tracking-[0.5px]'>Helping Students Step Beyond the Classroom—The Smartest Student Companion for Quick News, Knowledge, and Confidence!</p>
         </div>


          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filtered.map((p) => {
              const variant = p.variants?.[0] || {};
              const price =
                Number(variant.sale_price) > 0
                  ? Number(variant.sale_price)
                  : Number(variant.price) || 0;
              return (
                <div
                  key={`${p.id}-${variant.vid}`}
                  className="bg-white rounded-[16px] shadow-sm p-3 flex flex-col"
                >
                  <div
                    className="rounded-[12px] overflow-hidden cursor-pointer"
                    // onClick={() => handleViewDetails(p)}
                    onClick={() => goToDetails(p)}
                  >
                    <img
                      src={`https://thenewspotent.com/manage/assets/uploads/${p.image}`}
                      alt={p.name}
                      className="w-full object-cover"
                    />
                  </div>
                  <div className="mt-3 flex flex-col items-center text-center flex-grow">
                    <h4 className="text-[#0E283A] text-[16px] font-medium">
                      {p.name}
                    </h4>
                    <p className="text-[#2972A5] mt-1">₹ {price}/-</p>
                  </div>
                  <button
                    onClick={() => goToDetails(p)}
                    className="mt-3 h-11 rounded-full bg-[#2972A5] text-white font-medium hover:opacity-95"
                  >
                    View Product
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extras */}
      {/* <SpecialDealsSlider /> */}
      {/* <OwnPerfume /> */}
    </div>
  );
}
