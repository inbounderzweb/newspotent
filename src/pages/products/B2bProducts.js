// src/components/ProductList.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import bag from '../../assets/bag.svg';
import ValidateOnLoad from '../../components/ValidateOnLoad';

import { useGetProductsQuery } from '../../features/product/productApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const API_BASE = 'https://ikonixperfumer.com/beta/api';

// Sync guest → server cart
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
  localStorage.setItem(
    'guestCart',
    JSON.stringify(
      items.map(it => ({
        id:    it.id,
        vid:   it.variantid ?? it.vid,
        name:  it.name,
        image: it.image,
        price: it.price,
        qty:   Number(it.qty),
      }))
    )
  );
}

export default function B2BProducts() {
  const navigate = useNavigate();
  const { user, token, isTokenReady } = useAuth();
  const { refresh } = useCart();

  const { data, isLoading, isError, refetch } = useGetProductsQuery(
    undefined,
    { skip: !isTokenReady }
  );

  useEffect(() => {
    if (isTokenReady) refetch();
  }, [isTokenReady, refetch]);

  const products = data?.data || [];

  // Guest-cart helpers
  const readGuest  = () => JSON.parse(localStorage.getItem('guestCart') || '[]');
  const writeGuest = arr => localStorage.setItem('guestCart', JSON.stringify(arr));

  const saveGuestCart = product => {
    const raw     = readGuest();
    const variant = product.variants?.[0] || {};
    const vid     = variant.vid;
    const price   = variant.sale_price || variant.price || 0;
    const idx     = raw.findIndex(i => i.id === product.id && i.vid === vid);

    if (idx > -1) raw[idx].qty += 1;
    else raw.push({ id: product.id, vid, name: product.name, image: product.image, price, qty: 1 });

    writeGuest(raw);
    alert(`${product.name} added to cart (guest)`);
    refresh();
  };

  const handleAddToCart = async product => {
    if (!token || !user) {
      saveGuestCart(product);
      return;
    }
    const variant = product.variants?.[0] || {};
    try {
      const { data: resp } = await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({
          userid:    user.id,
          productid: product.id,
          variantid: variant.vid,
          qty:       1,
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (resp.success) {
        alert(`${product.name} added to cart`);
        await syncGuestCartWithServer(user.id, token);
        refresh();
      } else {
        alert(resp.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error?.response?.data || error);
      alert('Error adding to cart. Check console.');
    }
  };

  // --- Mobile horizontal scrolling setup ---
  const scrollerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 1024 : true));
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollByAmount = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(window.innerWidth * 0.75); // ~ 75% of viewport
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  if (isLoading) return <p className="text-center py-8">Loading…</p>;
  if (isError)   return <p className="text-center py-8">Error loading products.</p>;

  return (
    <>
      <ValidateOnLoad />

      <section className="bg-blue-50 py-12">
        {/* Heading */}
        <h2 className="text-center text-2xl font-semibold text-blue-800 mb-6">
          Products
        </h2>

        {/* Green promo bar */}
        <div className="mx-auto mb-10 w-[90%] h-60 bg-green-800 rounded-xl" />

        {/* Desktop: grid | Mobile/Tablet: horizontal scroll-snap strip */}
        {isMobile ? (
          <div className="relative w-[90%] mx-auto">
            {/* edge gradients */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-blue-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-blue-50 to-transparent" />

            {/* Scroll track */}
            <div
              ref={scrollerRef}
              className="
                flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2
                [-ms-overflow-style:none] [scrollbar-width:none]
              "
              style={{ scrollbarWidth: 'none' }}
            >
              {/* hide scrollbar (WebKit) */}
              <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
              `}</style>

              {products.map(product => {
                const variant = product.variants?.[0] || {};
                const msrp    = Number(variant.price)      || 0;
                const sale    = Number(variant.sale_price) || msrp;
                const vid     = variant.vid;

                return (
                  <div
                    key={`${product.id}-${vid}`}
                    className="
                      hide-scrollbar snap-start shrink-0
                      w-[78vw] sm:w-[60vw]
                      max-w-[420px]
                      rounded-xl shadow-lg overflow-hidden relative bg-white
                    "
                  >
                    {/* Category badge */}
                    <span className="absolute top-2 left-2 inline-block rounded-full border border-[#8C7367] px-3 py-1 text-xs text-[#8C7367] bg-white/90">
                      {product.category_name}
                    </span>

                    {/* Add-to-cart button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="absolute top-2 right-2 rounded-full p-1 bg-white/90 shadow"
                    >
                      <img src={bag} alt="cart" className="h-6 w-6" />
                    </button>

                    {/* Product Image */}
                    <img
                      onClick={() =>
                        navigate('/product-details', { state: { product, vid } })
                      }
                      src={`https://ikonixperfumer.com/beta/assets/uploads/${product.image}`}
                      alt={product.name}
                      className="w-full h-72 object-cover cursor-pointer"
                    />

                    {/* Info */}
                    <div className="text-center grid gap-3 my-5 px-3">
                      <h3 className="text-[#2A3443] font-[Lato] text-[16px] leading-snug">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-center gap-2">
                        {sale < msrp && (
                          <span className="text-sm line-through text-[#2A3443]/60">
                            ₹{msrp}/-
                          </span>
                        )}
                        <span className="font-semibold text-[#2A3443]">
                          ₹{sale}/-
                        </span>
                      </div>

                      <button
                        onClick={() => navigate('/product-details', { state: { product, vid } })}
                        className="bg-[#2972A5] py-2 px-4 text-white text-[16px] mx-10 rounded-[24px]"
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seek buttons */}
            {/* <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => scrollByAmount(-1)}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={() => scrollByAmount(1)}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Next
              </button>
            </div> */}
          </div>
        ) : (
          <div className="w-[90%] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => {
              const variant = product.variants?.[0] || {};
              const msrp    = Number(variant.price)      || 0;
              const sale    = Number(variant.sale_price) || msrp;
              const vid     = variant.vid;

              return (
                <div
                  key={`${product.id}-${vid}`}
                  className="rounded-xl shadow-lg overflow-hidden flex flex-col relative bg-white"
                >
                  <span className="absolute top-2 left-2 inline-block rounded-full border border-[#8C7367] px-3 py-1 text-xs text-[#8C7367] bg-white/90">
                    {product.category_name}
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="absolute top-2 right-2 rounded-full p-1 bg-white/90 shadow"
                  >
                    <img src={bag} alt="cart" className="h-6 w-6" />
                  </button>

                  <img
                    onClick={() => navigate('/product-details', { state: { product, vid } })}
                    src={`https://ikonixperfumer.com/beta/assets/uploads/${product.image}`}
                    alt={product.name}
                    className="w-full h-72 object-cover cursor-pointer"
                  />

                  <div className="text-center grid gap-3 my-5 px-3">
                    <h3 className="text-[#2A3443] font-[Lato] text-[16px] leading-snug">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-center gap-2">
                      {sale < msrp && (
                        <span className="text-sm line-through text-[#2A3443]/60">
                          ₹{msrp}/-
                        </span>
                      )}
                      <span className="font-semibold text-[#2A3443]">
                        ₹{sale}/-
                      </span>
                    </div>

                    <button
                      onClick={() => navigate('/product-details', { state: { product, vid } })}
                      className="bg-[#2972A5] py-2 px-4 text-white text-[16px] mx-10 rounded-[24px]"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Products (kept) */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2 text-[#0E283A] border-[1px] border-[#0E283A] rounded-full hover:opacity-90 transition"
          >
            View all Products
          </button>
        </div>
      </section>
    </>
  );
}
