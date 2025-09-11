// src/components/ProductList.js
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import bag from '../../assets/bag.svg';
import ValidateOnLoad from '../../components/ValidateOnLoad';

import { useGetProductsQuery } from '../../features/product/productApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Spinner from '../../components/loader/Spinner';

const API_BASE = 'https://thenewspotent.com/manage/api';

// --- Guest cart helpers here match CartContext’s format & sanitation ---
const readGuest = () => {
  const raw = JSON.parse(localStorage.getItem('guestCart') || '[]');
  const normalized = (Array.isArray(raw) ? raw : []).map(x => ({
    id:    x.productid ?? x.id,
    vid:   x.variantid ?? x.vid,
    name:  x.name,
    image: x.image,
    price: Number(x.price) || 0,
    qty:   Number(x.qty)   || 1,
  }));
  const byKey = new Map();
  for (const it of normalized) {
    const key = `${it.id}::${it.vid}`;
    const prev = byKey.get(key);
    byKey.set(
      key,
      prev
        ? { ...it, qty: (Number(prev.qty) || 0) + (Number(it.qty) || 0) }
        : it
    );
  }
  return Array.from(byKey.values());
};

const writeGuest = arr => {
  const safe = (Array.isArray(arr) ? arr : []).map(i => ({
    id:    i.id,
    vid:   i.vid ?? i.variantid,
    name:  i.name,
    image: i.image,
    price: Number(i.price) || 0,
    qty:   Number(i.qty)   || 1,
  }));
  localStorage.setItem('guestCart', JSON.stringify(safe));
};

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
  writeGuest(
    items.map(it => ({
      id:    it.id,
      vid:   it.variantid ?? it.vid,
      name:  it.name,
      image: it.image,
      price: Number(it.price) || 0,
      qty:   Number(it.qty)   || 1,
    }))
  );
}

export default function OurProducts() {
  const navigate = useNavigate();
  const { user, token, isTokenReady } = useAuth();
  const { refresh } = useCart();

  // ▶︎ Fire the products request—but only after token is ready:
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery(
    undefined,
    { skip: !isTokenReady }
  );

  // ▶︎ Once token lands, retry the fetch
  useEffect(() => {
    if (isTokenReady) {
      refetch();
    }
  }, [isTokenReady, refetch]);

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
    // Fallback: if API doesn’t mark bestsellers yet, show first 8 to avoid empty UI.
    return picks.length ? picks : products.slice(0, 8);
  }, [products]);

  const saveGuestCart = product => {
    const current = readGuest();
    const variant = product.variants?.[0] || {};
    const vid     = variant.vid;
    const price   = Number(variant.sale_price || variant.price || 0) || 0;

    const idx = current.findIndex(i => i.id === product.id && i.vid === vid);
    if (idx > -1) {
      current[idx].qty = (Number(current[idx].qty) || 0) + 1;
    } else {
      current.push({
        id:    product.id,
        vid,
        name:  product.name,
        image: product.image,
        price,
        qty:   1,
      });
    }
    writeGuest(current);
    alert(`${product.name} added to cart (guest)`);
    refresh();
  };

  // Add to cart handler
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

      if (resp?.success) {
        alert(`${product.name} added to cart`);
        await syncGuestCartWithServer(user.id, token);
        refresh();
      } else {
        alert(resp?.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error?.response?.data || error);
      alert('Error adding to cart. Check console.');
    }
  };

  if (isLoading) return <p className="text-center py-8">
    <Spinner/>
  </p>;
  if (isError)   return <p className="text-center py-8">Error loading products..</p>;

  return (
    <>
      {/* kick off token validation */}
      <ValidateOnLoad />

<div className='font-[manrope] text-[#256795] text-[25px] leading-[120%] tracking-[0.5px] mx-auto w-full text-center my-5'>Our Products</div>
<div className='mx-auto w-[80%] lg:w-[50%] text-center text-[#000] text-[manrope] font-[400] pb-5 text-[16px] leading-[170%] tracking-[0.5px]'>
  <span>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod 
tincidunt ut laoreet dolore magna aliquam erat volutpat.</span>
</div>
<div className="h-[220px] bg-[#676586] rounded-[24px] mx-auto w-[90%] md:w-[75%] py-8"></div>


      <section className="mx-auto w-[90%] md:w-[75%] py-8">
        {/* 🔥 Removed filter pills completely */}

        {/* Products Grid/List — Best Sellers only */}
        <div
          className="
            flex flex-row gap-6 overflow-x-auto pb-4
            sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0
          "
        >
          {bestSellers.map(product => {
            const variant = product.variants?.[0] || {};
            const vid     = variant.vid;
            const msrp    = Number(variant.price)      || 0;
            const sale    = Number(variant.sale_price) || msrp;

            return (
              <div
                key={`${product.id}-${vid}`}
                className="min-w-[80%] lg:min-w-[60%] sm:min-w-0 relative overflow-hidden rounded-[10px]"
              >
                {/* Category badge (optional) */}
                {/* {product.category_name && (
                  <span className="absolute top-2 left-2 inline-block rounded-full border border-[#8C7367] px-3 py-1 text-xs text-[#8C7367]">
                    {product.category_name}
                  </span>
                )} */}

                {/* Add-to-cart button */}
                {/* <button
                  onClick={e => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="absolute top-2 right-2 rounded-full p-1"
                >
                  <img src={bag} alt="cart" className="" />
                </button> */}

                {/* Product Image */}


<div className='p-2 bg-white rounded-[8px]'>

 <img
                  onClick={() =>
                    navigate('/product-details', {
                      state: { product, vid },
                    })
                  }
                  src={`https://thenewspotent.com/manage/assets/uploads/${product.image}`}
                  alt={product.name}
                  className="w-full object-cover cursor-pointer rounded-[8px]"
                />

                {/* Info */}
                <div className="pt-4">
                  <div>
                    <h3 className="text-[#2A3443] font-[manrope] text-[16px] leading-[170%] tracking-[0.5px] text-center">
                      {product.name}
                    </h3>
                    {/* {product.category_name && (
                      <p className="text-[#2A3443] font-[Lato] text-[14px]">
                        {product.category_name}
                      </p>
                    )} */}
                  </div>
                  <div className="text-center">
                    {/* {sale < msrp && (
                      <span className="text-xs line-through text-[#2A3443] font-[Lato] block">
                        ₹{msrp}/-
                      </span>
                    )} */}
                    <span className="font-normal leading-[170%] tracking-[0.5px] text-[18px] text-[#2972A5]">₹{sale}/-</span>
                    <br/>
                       <button className='text-center w-full lg:w-[50%] mx-auto justify-center items-center bg-[#2972A5] text-white py-2 rounded-full mt-2'  onClick={() =>
                    navigate('/product-details', {
                      state: { product, vid },
                    })
                  }>View Product</button>
                  </div>
                </div>

</div>



              </div>
            );
          })}
        </div>

        {/* View All */}
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
