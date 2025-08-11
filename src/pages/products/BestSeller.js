// src/pages/products/BestSeller.jsx
// Prereqs:
// npm i react-slick slick-carousel axios qs @heroicons/react
// In your global styles (e.g., index.js/_app.js):
//   import "slick-carousel/slick/slick.css";
//   import "slick-carousel/slick/slick-theme.css";

import React, { useEffect, useRef } from "react";
import Slider from "react-slick";
import { HiOutlineArrowRight, HiOutlineArrowLeft } from "react-icons/hi";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import qs from "qs";

import { useGetProductsQuery } from "../../features/product/productApi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

import bestsellers from "../../assets/best-seller.svg";

const API_BASE = "https://ikonixperfumer.com/beta/api";

/* ---------------- Sync guest → server cart ---------------- */
async function syncGuestCartWithServer(userId, token) {
  const resp = await axios.post(
    `${API_BASE}/cart`,
    qs.stringify({ userid: userId }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const items = resp.data?.data || [];
  localStorage.setItem(
    "guestCart",
    JSON.stringify(
      items.map((it) => ({
        id: it.id,
        vid: it.variantid ?? it.vid,
        name: it.name,
        image: it.image,
        price: it.price,
        qty: Number(it.qty),
      }))
    )
  );
}

export default function BestSeller() {
  const navigate = useNavigate();
  const { user, token, isTokenReady } = useAuth();
  const { refresh } = useCart();
  const sliderRef = useRef(null); // hook at top (before any early returns)

  // Fetch products once token is ready
  const { data, isLoading, isError, refetch } = useGetProductsQuery(
    undefined,
    { skip: !isTokenReady }
  );

  useEffect(() => {
    if (isTokenReady) refetch();
  }, [isTokenReady, refetch]);

  const products = data?.data || [];

  // Guest cart helpers
  const readGuest = () =>
    JSON.parse(localStorage.getItem("guestCart") || "[]");
  const writeGuest = (arr) =>
    localStorage.setItem("guestCart", JSON.stringify(arr));

  const saveGuestCart = (product) => {
    const raw = readGuest();
    const variant = product.variants?.[0] || {};
    const vid = variant.vid;
    const price = variant.sale_price || variant.price || 0;
    const idx = raw.findIndex((i) => i.id === product.id && i.vid === vid);

    if (idx > -1) raw[idx].qty += 1;
    else
      raw.push({
        id: product.id,
        vid,
        name: product.name,
        image: product.image,
        price,
        qty: 1,
      });

    writeGuest(raw);
    alert(`${product.name} added to cart (guest)`);
    refresh();
  };

  const handleAddToCart = async (product) => {
    const variant = product.variants?.[0] || {};
    const vid = variant.vid;

    if (!token || !user) {
      saveGuestCart(product);
      return;
    }

    try {
      const { data: resp } = await axios.post(
        `${API_BASE}/cart`,
        qs.stringify({
          userid: user.id,
          productid: product.id,
          variantid: vid,
          qty: 1,
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (resp.success) {
        alert(`${product.name} added to cart`);
        await syncGuestCartWithServer(user.id, token);
        refresh();
      } else {
        alert(resp.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("❌ Error adding to cart:", error?.response?.data || error);
      alert("Error adding to cart. Check console.");
    }
  };

  // Slider settings (custom bottom controls)
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }],
  };

  // You can still return early AFTER hooks are declared
  if (isLoading) return <p className="text-center py-8">Loading…</p>;
  if (isError) return <p className="text-center py-8">Error loading products.</p>;

  return (
    <section className="pt-[40px] w-full">
      <div className="mx-auto ml-4 md:ml-auto flex w-[90%] flex-col relative gap-6 md:flex-row md:items-start md:justify-between">
        {/* Left — Illustration */}
        <img
          src={bestsellers}
          alt="Instagram page preview"
          className="mx-auto object-contain md:mx-0 w-full md:w-[55%] lg:w-[28%]"
        />

        {/* Mobile gradient (kept from your version) */}
        <div className="pointer-events-none z-10 absolute top-[22.3rem] right-0 w-full h-40 flex lg:hidden bg-gradient-to-t from-[#c8a997] via-[#c8a997]/80 to-transparent" />

        {/* Right — Carousel */}
        <div className="relative ml-auto w-full overflow-hidden md:flex-1 md:pl-4 mt-[-4rem] lg:mt-0 z-20 pb-[56px]">
            <h1 className="text-[#256795] font-manrope text-[25px]">Best Seller</h1>
          <Slider ref={sliderRef} {...settings}>
            {products.map((product) => {
              const variant = product.variants?.[0] || {};
              const msrp = Number(variant.price) || 0;
              const sale = Number(variant.sale_price) || msrp;
              const vid = variant.vid;

              return (
                <div key={`${product.id}-${vid}`} className="px-2">
                  <div className="rounded-xl shadow-lg overflow-hidden flex flex-col relative bg-white">
                    {/* Category badge */}
                    <span className="absolute top-2 left-2 inline-block rounded-full border border-[#8C7367] px-3 py-1 text-xs text-[#8C7367] bg-white/90">
                      {product.category_name}
                    </span>

                    {/* Add-to-cart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="absolute top-2 right-2 rounded-full p-2 bg-white/90 shadow"
                      aria-label="Add to cart"
                      title="Add to cart"
                    >
                      <ShoppingBagIcon className="h-5 w-5 text-[#2A3443]" />
                    </button>

                    {/* Product Image */}
                    <img
                      onClick={() =>
                        navigate("/product-details", {
                          state: { product, vid },
                        })
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
                        onClick={() =>
                          navigate("/product-details", { state: { product, vid } })
                        }
                        className="bg-[#2972A5] py-2 px-4 text-white text-[16px] mx-10 rounded-[24px]"
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>

          {/* Bottom control bar: left CTA, right arrows */}
          <div className="absolute bottom-2 left-0 w-full flex items-center justify-between px-2">
            <button
              onClick={() => navigate("/products")}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              View All Products
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100"
                aria-label="Previous"
              >
                <HiOutlineArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => sliderRef.current?.slickNext()}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100"
                aria-label="Next"
              >
                <HiOutlineArrowRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
