// src/components/CartDrawer.js
import React, { useEffect, useState, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ open, onClose }) {
  const [show, setShow] = useState(open);
  const { items, inc, dec, remove, refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const prevOpen = useRef(open);
  const ANIM_MS = 300;

  // 1) refresh on open
  useEffect(() => {
    if (!prevOpen.current && open) refresh();
    prevOpen.current = open;
  }, [open, refresh]);

  // 2) mount/unmount for animation
  useEffect(() => {
    if (open) setShow(true);
    else {
      const t = setTimeout(() => setShow(false), ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 3) keep checkout in sync
  useEffect(() => {
    if (location.pathname === '/checkout') {
      navigate('/checkout', { state: { cartItems: items }, replace: true });
    }
  }, [items, location.pathname, navigate]);

  if (!show) return null;

  // SAFE reduce: coerce qty to numbers
  const totalCount = items.reduce(
    (sum, i) => (Number(sum) || 0) + (Number(i.qty) || 0),
    0
  );

  const goCheckout = () => {
    onClose();
    navigate('/checkout', { state: { cartItems: items } });
  };

  return (
   <div className={`fixed inset-0 z-[100] flex ${!open ? 'pointer-events-none' : ''}`}>
  {/* Backdrop */}
  <div
    onClick={onClose}
    className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
      open ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  />

  {/* Drawer */}
  <div
    className={`relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ${
      open ? 'translate-x-0' : 'translate-x-full'
    }`}
  >
    {/* Header */}
    <div className="sticky top-0 z-10 bg-[#f5f9fb] p-5 border-b border-[#d1e2f1] flex items-center justify-between">
      <div className="flex flex-col leading-tight">
        <span className="text-[22px] font-semibold text-[#194463] font-[luxia]">Your Cart</span>
        <span className="text-[#2972A5] text-[14px]">
          {totalCount > 0 ? `${totalCount} item${totalCount > 1 ? 's' : ''}` : 'No items'}
        </span>
      </div>
      <button onClick={onClose} className="hover:bg-[#e5f2fa] p-2 rounded-full transition">
        <XMarkIcon className="h-6 w-6 text-[#194463]" />
      </button>
    </div>

    {/* Items Section */}
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f9fcfe]">
      {items.length === 0 ? (
        <p className="text-center text-[#2972A5] mt-10 text-[16px]">Your cart is empty.</p>
      ) : (
        items.map(item => (
          <div
            key={`${item.id}-${item.variantid}`}
            className="bg-white rounded-xl shadow-md border border-[#dce8f3] p-4 flex gap-4 items-start transition hover:shadow-lg"
          >
            <img
              src={`https://thenewspotent.com/manage/assets/uploads/${item.image}`}
              alt={item.name}
              className="w-28 h-28 object-cover rounded-lg"
            />
            <div className="flex flex-col flex-1 justify-between">
              <div>
                <p className="text-[#194463] font-[lato] text-[18px] font-semibold leading-tight">
                  {item.name}
                </p>
                <p className="text-[#2972A5] text-[16px] font-bold mt-1">₹{item.price}</p>
              </div>

              {/* Quantity and Remove */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border border-[#194463] rounded-full overflow-hidden">
                  <button
                    onClick={() => dec(item.cartid, item.id, item.variantid)}
                    className="px-3 py-1 text-[#194463] font-bold"
                  >
                    −
                  </button>
                  <span className="px-4 text-[#194463] font-medium">{Number(item.qty) || 0}</span>
                  <button
                    onClick={() => inc(item.cartid, item.id, item.variantid)}
                    className="px-3 py-1 text-[#194463] font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => remove(item.cartid, item.id, item.variantid)}
                  className="text-[#2972A5] text-sm underline hover:text-[#194463] transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Footer (Sticky Summary) */}
    {items.length > 0 && (
      <div className="sticky bottom-0 bg-white border-t border-[#d1e2f1] px-6 py-5">
        <button
          onClick={goCheckout}
          className="w-full py-3 bg-[#2972A5] text-white text-lg rounded-md font-semibold hover:bg-[#194463] transition"
        >
          Proceed to Checkout
        </button>
      </div>
    )}
  </div>
</div>

  );
}