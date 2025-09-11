// src/pages/product-details/ProductDetails.js
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
import DiscoverMore from './DiscoverMore';
import OwnPerfume from '../../../components/ownperfume/OwnPerfume';
import SpecialDealsSlider from '../../../components/SpecialDealsSlider/SpecialDealsSlider';

const API_BASE = 'https://thenewspotent.com/manage/api';

export default function ProductDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { refresh } = useCart();

  const hintProd = state?.product;
  const vid = state?.vid;
  const pid = hintProd?.id;

  const [product, setProduct] = useState(hintProd);
  const [loading, setLoading] = useState(!hintProd);
  const [error, setError] = useState('');

  // fetch by product + variant id
  useEffect(() => {
    if (!pid || !vid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        const url = `${API_BASE}/products/${pid}?vid=${vid}`;
        const { data } = await axios.get(url, { headers });
        if (!cancelled) setProduct(data?.data || data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Unable to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pid, vid, token]);

  // gallery images
  const images = useMemo(() => {
    if (!product) return [];
    const pics = [];
    if (product.image) pics.push(product.image);
    if (product.more_images) {
      const extras = Array.isArray(product.more_images)
        ? product.more_images
        : String(product.more_images)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      for (const img of extras) {
        if (!pics.includes(img)) pics.push(img);
      }
    }
    return pics;
  }, [product]);

  const [activeImg, setActiveImg] = useState('');
  useEffect(() => {
    if (images.length) setActiveImg(images[0]);
  }, [images]);

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

  // variants -> map index 0/1 to Global/Karnataka if present
  const variantOptions = useMemo(
    () =>
      (product?.variants || []).map((v) => ({
        vid: v.vid,
        label: v.weight ? `${v.weight} ml` : v.label || '',
        price: Number(v.price) || 0,
        sale_price: Number(v.sale_price) || 0,
      })),
    [product]
  );
  const [selectedVar, setSelectedVar] = useState(variantOptions[0] || {});
  useEffect(() => {
    if (variantOptions.length) setSelectedVar(variantOptions[0]);
  }, [variantOptions]);

  // fake “edition” pills to match UI (bind to variant 0/1 when available)
  const editions = [
    { key: 'global', label: 'Global Edition', boundIndex: 0 },
    { key: 'karnataka', label: 'Karnataka Edition', boundIndex: 1 },
  ];
  const [edition, setEdition] = useState(editions[0].key);
  useEffect(() => {
    const idx = editions.find((e) => e.key === edition)?.boundIndex ?? 0;
    if (variantOptions[idx]) setSelectedVar(variantOptions[idx]);
  }, [edition, variantOptions]);

  // qty
  const [qty, setQty] = useState(2); // screenshot shows "2" preselected
  // price calc (fix)
  const unitPrice =
    selectedVar?.sale_price && selectedVar.sale_price < selectedVar.price
      ? selectedVar.sale_price
      : selectedVar?.price || 0;
  const totalPrice = (unitPrice || 0) * qty;

  // server/guest cart
  const addGuest = () => {
    const guest = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const idx = guest.findIndex((i) => i.vid === selectedVar.vid);
    if (idx > -1) guest[idx].qty += qty;
    else
      guest.push({
        id: pid,
        vid: selectedVar.vid,
        name: product.name,
        image: product.image,
        price: unitPrice,
        qty,
      });
    localStorage.setItem('guestCart', JSON.stringify(guest));
    alert(`${product.name} added to cart (guest)`);
  };

  const addServer = () =>
    axios.post(
      `${API_BASE}/cart`,
      qs.stringify({
        userid: user.id,
        productid: pid,
        variantid: selectedVar.vid,
        qty,
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

  const handleAddToCart = async () => {
    if (!token || !user) return addGuest();
    try {
      await addServer();
      await refresh();
      alert(`${product.name} added to cart`);
    } catch {
      alert('Error adding to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!token || !user) {
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

  if (loading) return <p className="p-6 text-center">Loading…</p>;
  if (error || !product) {
    return (
      <div className="p-6">
        {error || 'Product not found.'}&nbsp;
        <Link to="/shop" className="underline text-blue-600">
          Back to Shop
        </Link>
      </div>
    );
  }

  // fallback text to match screenshot’s hero copy
  const heroSubtitle =
    product?.short_description ||
    'We believe Colours are in the mind—so we made this book in Black and White';

  const subTitleBlock =
    product?.subtitle ||
    'Helping Students Step Beyond the Classroom—The Smartest Student Companion for Quick News, Knowledge, and Confidence!';

  return (
    <div className="w-full bg-white">
      <div className="w-full px-2 lg:px-20">
        {/* Top breadcrumb (kept minimal) */}
        <nav className="text-sm text-[#0E283A]/70 mb-4 md:mb-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:underline">
            Products
          </Link>
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

            {/* Thumbnail rail with arrows */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={prevImg}
                className="h-6 w-6 rounded-full bg-white/60 flex items-center justify-center"
                aria-label="Prev"
              >
                <ChevronLeftIcon className="h-4 w-4 text-[#0E283A]" />
              </button>

              <div className="flex gap-3">
                {(images.length ? images : [activeImg]).slice(0, 3).map((img) => (
                  <button
                    key={img || 'placeholder'}
                    onClick={() => img && setActiveImg(img)}
                    className={`h-20 w-20 rounded-xl overflow-hidden border transition bg-white/60 ${
                      img && img === activeImg
                        ? 'border-[#2972A5]'
                        : 'border-[#BFD2E1]'
                    }`}
                  >
                    {img ? (
                      <img
                        src={`https://thenewspotent.com/manage/assets/uploads/${img}`}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={nextImg}
                className="h-6 w-6 rounded-full bg-white/60 flex items-center justify-center"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-4 w-4 text-[#0E283A]" />
              </button>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col">
            {/* Eyebrow + Share */}
            <div className="flex items-start justify-between">
              <div className="text-[#2972A5] text-sm">1st Edition</div>
              <button className="p-2 rounded-full hover:bg-white/50" aria-label="Share">
                <ShareIcon className="h-5 w-5 text-[#0E283A]" />
              </button>
            </div>

            {/* Title */}
            <h1 className="mt-1 text-[#215B84] text-[manrope] text-[31px] md:text-[34px] font-[700] leading-[125%]">
              {product.name || 'The Newspotent Yearbook'}
            </h1>

            {/* Subtitle under title */}
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

            {/* Price + Editions + Delivery panel (bordered like screenshot) */}
            <div className="mt-5 rounded-[12px] border border-[#C9D6E2] bg-white/50 p-4 md:p-5">
              {/* Price segmented tabs */}
              <div className="inline-flex rounded-[10px] overflow-hidden border border-[#C9D6E2]">
                {[
                  { key: 'year', label: 'Year book', price: 799 },
                  { key: 'quarter', label: 'Quarterly book', price: 799 },
                ].map((p, idx) => (
                  <div
                    key={p.key}
                    className={`px-4 py-2 text-sm md:text-base ${
                      idx === 0 ? 'bg-[#E7EEF5]' : 'bg-white'
                    }`}
                  >
                    <div className="font-medium">{p.label}</div>
                    <div className="text-[#0E283A] font-semibold">₹ {p.price}</div>
                  </div>
                ))}
              </div>

              {/* Editions pills */}
              <div className="mt-4 flex gap-3">
                {editions.map((e) => {
                  const selected = edition === e.key;
                  return (
                    <button
                      key={e.key}
                      onClick={() => setEdition(e.key)}
                      className={[
                        'px-4 py-2 rounded-full border text-sm',
                        selected
                          ? 'bg-[#E7EEF5] border-[#C9D6E2] text-[#0E283A]'
                          : 'bg-white border-[#C9D6E2] text-[#0E283A]/80',
                      ].join(' ')}
                    >
                      {e.label}
                    </button>
                  );
                })}
              </div>

              {/* Sub-title block + right delivery card */}
              <div className="mt-4 flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="text-sm text-[#0E283A]/70 mb-1">Sub-title:</div>
                  <div className="text-sm text-[#0E283A]/90 leading-[150%]">
                    {subTitleBlock}
                  </div>

                  {/* Quantity + Add to Cart */}
                  <div className="mt-4 flex items-center gap-3">
                    {/* qty */}
                    <div className="flex items-center justify-between border border-[#C9D6E2] rounded-full h-12 w-[140px] bg-white">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty === 1}
                        className="px-4 py-2 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="h-5 w-5 text-[#0E283A]" />
                      </button>
                      <span className="min-w-[2rem] text-center text-[#0E283A]">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="px-4 py-2"
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="h-5 w-5 text-[#0E283A]" />
                      </button>
                    </div>

                    {/* add to cart pill */}
                    <button
                      onClick={handleAddToCart}
                      className="h-12 px-6 rounded-full bg-[#2972A5] text-white font-medium hover:opacity-95"
                    >
                      Add To Cart
                    </button>
                  </div>

                  {/* Buy now */}
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
                      <div className="text-[#0E283A]/70">
                        Enter your Postal code for Delivery Availability
                      </div>
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

              {/* price total (align with screenshot’s total near CTA) */}
              <div className="sr-only">
                ₹{totalPrice.toFixed(0)}/-
              </div>
            </div>

            {/* Accordions */}
            <div className="mt-6 divide-y divide-[#C9D6E2] rounded-[8px] bg-transparent">
              {[
                'Description',
                'Table of Content',
                "Editor(s)",
                "Critics’ Reviews",
                'Shipping Options',
                'Disclaimer',
              ].map((t) => (
                <details key={t} className="group">
                  <summary className="cursor-pointer list-none py-4 text-[#0E283A] flex items-center justify-between">
                    <span className="font-medium">{t}</span>
                    <svg
                      className="h-5 w-5 text-[#0E283A] transition-transform group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>
                  <div className="pb-4 text-sm text-[#0E283A]/80">
                    {/* Replace with real content */}
                    {t} content goes here.
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-[#C9D6E2] mt-8 w-full" />

        {/* Discover more section */}
        <DiscoverMore currentId={product.id} />
        {/* <SpecialDealsSlider /> */}
        {/* <OwnPerfume /> */}
      </div>
    </div>
  );
}
