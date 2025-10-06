// src/pages/product-details/DiscoverMore.js
import React, { useState, useEffect } from 'react';
import { useGetProductsQuery } from '../../../features/product/productApi';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://thenewspotent.com/manage/api';

export default function DiscoverMore() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetProductsQuery();
  const { user, token } = useAuth();

  const [moreProducts, setMoreProducts] = useState([]);

  useEffect(() => {
    if (data?.data) setMoreProducts(data.data);
  }, [data]);

  // ---- Cart helpers (guest + server) ----
  const writeGuest = (items) =>
    localStorage.setItem('guestCart', JSON.stringify(items));

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
  };

  const syncGuestCartWithServer = async (userId, tokenStr) => {
    try {
      const resp = await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({ userid: userId }),
        {
          headers: {
            Authorization: `Bearer ${tokenStr}`,
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
    } catch (e) {
      console.error('sync error', e);
    }
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
      } else {
        alert(resp?.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('add error', err?.response?.data || err);
      alert('Error adding to cart.');
    }
  };

  if (isLoading) return <p className="text-center py-10">Loading…</p>;
  if (isError) return <p className="text-center py-10">Something went wrong.</p>;

  // Take top 4 to mirror the design
  const items = moreProducts.slice(0, 4);

  return (
    <section className="w-full bg-[#E6EEF5] py-10 md:py-14">

      
      <div className="mx-auto w-[92%] md:w-[85%] xl:w-[1200px]">
        {/* Heading */}
        <h2 className="text-center text-[28px] md:text-[32px] font-semibold text-[#2972A5]">
          Similar Items You Might Also Like
        </h2>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((p) => {
            const variant = p.variants?.[0] || {};
            const price =
              Number(variant.sale_price) > 0
                ? Number(variant.sale_price)
                : Number(variant.price) || 0;

            return (
              <div
                key={`${p.id}-${variant.vid || 'v0'}`}
                className="rounded-[18px] bg-[#F4F6F8] p-4 shadow-sm"
              >
                {/* Image */}
                <div className="rounded-[16px] overflow-hidden bg-white">
                  <img
                  onClick={() =>
                      navigate(`/product/${p.id}`, {
                        state: { product: p, vid: variant.vid ?? null },
                      })
                    }
                    src={`https://thenewspotent.com/manage/assets/uploads/${p.image}`}
                    alt={p.name}
                    className="w-full h-[220px] object-cover"
                  />
                </div>

                {/* Title + Price */}
                <div className="mt-4 text-center">
                  <h3 className="text-[#0E283A] text-[18px] font-medium leading-tight">
                    {p.name || 'Product Full Name 2025'}
                  </h3>
                  <div className="mt-1 text-[15px] text-[#2972A5]">
                    ₹ {price.toFixed(0)}/-
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() =>
                      navigate(`/product/${p.id}`, {
                        state: { product: p, vid: variant.vid ?? null },
                      })
                    }
                    className="h-11 px-6 rounded-full bg-[#2972A5] text-white font-medium hover:opacity-95"
                  >
                    View Product
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Product */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate('/shop')}
            className="h-12 px-8 md:px-10 rounded-full border-2 border-[#0E283A] text-[#0E283A] bg-transparent hover:bg-white/40"
          >
            View All Product
          </button>
        </div>
      </div>
    </section>
  );
}
