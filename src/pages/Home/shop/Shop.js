// src/pages/shop/Shop.js
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { useGetProductsQuery } from '../../../features/product/productApi';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';



const API_BASE = 'https://ikonixperfumer.com/beta/api';

/** Read/write guest cart in localStorage */
const readGuest = () => JSON.parse(localStorage.getItem('guestCart') || '[]');
const writeGuest = (arr) => localStorage.setItem('guestCart', JSON.stringify(arr));

/** Sync local guestCart with server cart */
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
  const serverItems = resp.data?.data || [];
  const formatted = serverItems.map((i) => ({
    id: i.id,
    name: i.name,
    image: i.image,
    price: i.price,
    qty: Number(i.qty),
  }));
  writeGuest(formatted);
}

export default function Shop() {
  const { data, isLoading, isError } = useGetProductsQuery();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { refresh } = useCart();

  // products array
  const products = useMemo(() => data?.data || [], [data]);

  // dynamic lists
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category_name).filter(Boolean))],
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand_name || p.brand).filter(Boolean))],
    [products]
  );

  // filter state
  const [selected, setSelected] = useState({ type: 'all', value: null }); // {type:'all'|'category'|'brand', value:string|null}
  const [brandOpen, setBrandOpen] = useState(true);

  // reset pagination when filter changes
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [selected]);

  // filter logic
  const filtered = useMemo(() => {
    if (selected.type === 'category' && selected.value) {
      return products.filter((p) => p.category_name === selected.value);
    }
    if (selected.type === 'brand' && selected.value) {
      const val = selected.value;
      return products.filter((p) => (p.brand_name || p.brand) === val);
    }
    return products;
  }, [products, selected]);

  // pagination (3 x 3 grid)
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageSlice = filtered.slice(pageStart, pageStart + pageSize);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // add-to-cart logic (kept for future use)
  const saveGuestCart = (product) => {
    const raw = readGuest();
    const variant = product.variants[0] || {};
    const idx = raw.findIndex((i) => i.id === product.id && i.vid === variant.vid);
    if (idx > -1) raw[idx].qty += 1;
    else
      raw.push({
        id: product.id,
        vid: variant.vid,
        name: product.name,
        image: product.image,
        price: variant.sale_price || variant.price,
        qty: 1,
      });
    writeGuest(raw);
    refresh();
  };

  const handleAddToCart = async (product) => {
    const variant = product.variants[0] || {};
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
      if (resp.success) {
        await syncGuestCartWithServer(user.id, token);
        refresh();
      } else {
        alert(resp.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err?.response?.data || err);
      alert('Error adding to cart. See console.');
    }
  };

  const handleViewDetails = (product) => {
    const variant = product.variants[0] || {};
    navigate('/product-details', { state: { product, vid: variant.vid } });
  };

  if (isLoading) return <p className="text-center py-20">Loading…</p>;
  if (isError) return <p className="text-center py-20">Something went wrong.</p>;

  // radio UI helper
  const RadioRow = ({ label, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition
                  ${active ? 'bg-white' : 'hover:bg-white/70'}`}
    >
      <span className="text-[#2A3443] text-sm">{label}</span>
      <span
        className={`w-5 h-5 rounded-full border flex items-center justify-center
                    ${active ? 'border-[#2A6EA0]' : 'border-gray-300'}`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-[#2A6EA0]' : 'bg-transparent'}`} />
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#C7D9E6] py-8">
      <div className="mx-auto w-[94%] xl:w-[82%]">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">

          {/* Sidebar Filters */}
          <aside className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 self-start sticky top-20">
            <h3 className="text-[#2A3443] font-semibold mb-4">Filters</h3>

            <div className="space-y-1">
              <RadioRow
                label="All Products"
                active={selected.type === 'all'}
                onClick={() => setSelected({ type: 'all', value: null })}
              />

              {/* Categories (first few visible like screenshot) */}
              {categories.map((c) => (
                <RadioRow
                  key={c}
                  label={c}
                  active={selected.type === 'category' && selected.value === c}
                  onClick={() => setSelected({ type: 'category', value: c })}
                />
              ))}
            </div>

            {/* Shop by brand (collapsible) */}
            {brands.length > 0 && (
              <div className="mt-4 border-t border-white/60 pt-3">
                <button
                  type="button"
                  onClick={() => setBrandOpen((o) => !o)}
                  className="w-full flex items-center justify-between py-2 px-1 text-left"
                >
                  <span className="text-[#2A3443] text-sm">Shop by brand</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${brandOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.127l3.71-3.896a.75.75 0 111.08 1.04l-4.24 4.46a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>
                {brandOpen && (
                  <div className="mt-1 space-y-1">
                    {brands.map((b) => (
                      <RadioRow
                        key={b}
                        label={b}
                        active={selected.type === 'brand' && selected.value === b}
                        onClick={() => setSelected({ type: 'brand', value: b })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Product Grid */}
          <main>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageSlice.map((product) => {
                const variant = product.variants[0] || {};
                const msrp = Number(variant.price) || 0;
                const sale = Number(variant.sale_price) || msrp;

                return (
                  <div
                    key={`${product.id}-${variant.vid}`}
                    className="bg-white/70 rounded-2xl p-3 shadow-sm"
                  >
                    {/* Image */}
                    <div className="rounded-xl overflow-hidden">
                      <img
                        src={`https://ikonixperfumer.com/beta/assets/uploads/${product.image}`}
                        alt={product.name}
                        className="w-full aspect-square object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="mt-3 px-1">
                      <p className="text-[#2A3443] text-sm">{product.name}</p>

                      <div className="mt-1 flex items-center justify-between">
                        <div className="text-xs">
                          {sale < msrp && (
                            <span className="line-through text-[#2A3443]/70 mr-2">₹{msrp}/-</span>
                          )}
                          <span className="text-[#2A8A5B] font-medium">₹ {sale}/-</span>
                        </div>
                      </div>

                      <button
                        className="mt-3 w-full h-10 rounded-full bg-[#2A6EA0] text-white text-sm font-medium hover:bg-[#245F8A] transition"
                        onClick={() => handleViewDetails(product)}
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="relative mt-8">
              <button
                className="absolute left-0 -translate-y-1/2 top-1/2 px-3 py-2 rounded-full hover:bg-white/40 disabled:opacity-40"
                onClick={goPrev}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-5 h-5 text-[#2A3443]" />
              </button>

              <p className="text-center text-sm text-[#2A3443]">
                Page {page} of {totalPages}
              </p>

              <button
                className="absolute right-0 -translate-y-1/2 top-1/2 px-3 py-2 rounded-full hover:bg-white/40 disabled:opacity-40"
                onClick={goNext}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRightIcon className="w-5 h-5 text-[#2A3443]" />
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Optional: keep these sections below grid */}
      {/* <div className="mt-10">
        <SpecialDealsSlider />
        <OwnPerfume />
      </div> */}
    </div>
  );
}
