// src/components/ProductList.js
import React, { useState, useMemo, useEffect } from 'react';
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


export default function Apparels() {
  const navigate = useNavigate();
  const { user, token, isTokenReady } = useAuth();
  const { refresh } = useCart();

  // ▶︎ Fire the products request—but only after token is ready:
  const { data, isLoading, isError, refetch } = useGetProductsQuery(
    undefined,
    { skip: !isTokenReady }
  );

  // ▶︎ Once token lands, retry the fetch
  useEffect(() => {
    if (isTokenReady) refetch();
  }, [isTokenReady, refetch]);

  const products = data?.data || [];

  // Guest-cart helpers
  const readGuest = () => JSON.parse(localStorage.getItem('guestCart') || '[]');
  const writeGuest = arr => localStorage.setItem('guestCart', JSON.stringify(arr));

  const saveGuestCart = product => {
    const raw = readGuest();
    const variant = product.variants[0] || {};
    const vid     = variant.vid;
    const price   = variant.sale_price || variant.price || 0;
    const idx     = raw.findIndex(i => i.id === product.id && i.vid === vid);

    if (idx > -1) raw[idx].qty += 1;
    else raw.push({ id: product.id, vid, name: product.name, image: product.image, price, qty: 1 });

    writeGuest(raw);
    alert(`${product.name} added to cart (guest)`);
    refresh();
  };

  // Add to cart handler
  const handleAddToCart = async product => {
    if (!token || !user) {
      saveGuestCart(product);
      return;
    }
    const variant = product.variants[0] || {};
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

  if (isLoading) return <p className="text-center py-8">Loading…</p>;
  if (isError)   return <p className="text-center py-8">Error loading products.</p>;

  return (
    <>
      {/* ensure token is validated */}
      <ValidateOnLoad />

      {/* Section wrapper with new UI */}
      <section className="py-28 bg-[#BDD3E3]">
        {/* Heading */}
        <div className='w-[70%] mx-auto'>
  <h3 className='text-[#256795] font-[manrope] text-[25px] text-center font-[600]'>Apparel Section</h3>
    <p className='text-[#0E283A] text-[16px] text-center font-[manrope] font-thin tracking-wide leading-8'>
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum.
    </p>
        </div>
       

        {/* Green promo bar */}
        <div className="mx-auto mb-10 w-[90%] h-60 bg-[#497383] rounded-xl" />

        {/* Products Grid */}
        <div className="w-[90%] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const variant = product.variants[0] || {};
            const msrp    = Number(variant.price)      || 0;
            const sale    = Number(variant.sale_price) || msrp;
            const vid     = variant.vid;

            return (
              <div
                key={`${product.id}-${vid}`}
                className="rounded-xl shadow-lg overflow-hidden flex flex-col relative bg-white"
              >
                {/* Category badge */}
                <span className="absolute top-2 left-2 inline-block rounded-full border border-[#8C7367] px-3 py-1 text-xs text-[#8C7367]">
                  {product.category_name}
                </span>

                {/* Add-to-cart button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="absolute top-2 right-2 rounded-full p-1"
                >
                  <img src={bag} alt="cart" className="h-6 w-6" />
                </button>

                {/* Product Image */}
                <img
                  onClick={() =>
                    navigate('/product-details', {
                      state: { product, vid },
                    })
                  }
                  src={`https://ikonixperfumer.com/beta/assets/uploads/${product.image}`}
                  alt={product.name}
                  className="w-full h-72 object-cover cursor-pointer"
                />

                {/* Info */}
                <div className='text-center grid gap-4 my-5'>
                    <h3 className="text-[#2A3443] font-[Lato] text-[16px] leading-snug">
                      {product.name}
                    </h3>
                    {/* <p className="text-[#2A3443] font-[Lato] text-[14px]">
                      {product.category_name}
                    </p>
                    {sale < msrp && (
                      <span className="text-xs line-through text-[#2A3443] block">
                        ₹{msrp}/-
                      </span>
                    )} */}
                     <span className="font-semibold text-[#2A3443]">
                      ₹{sale}/-
                    </span>
                    <button className='bg-[#2972A5] py-2 px-4 text-white text-[16px] mx-10 rounded-[24px]'>View all Products</button>

                </div>
              
                

              </div>
            );
          })}
        </div>

        {/* View All Products */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2  text-[#0E283A] border-[1px] border-[#0E283A] rounded-full hover:opacity-90 transition"
          >
            View all Products
          </button>
        </div>
      </section>
    </>
  );
}
