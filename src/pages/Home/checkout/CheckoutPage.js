// src/pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import loadRazorpay from '../../../utils/loadRazorpay';
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import AuthModal from '../../../Authmodal/AuthModal';
import Swal from 'sweetalert2';

const API_BASE = 'https://thenewspotent.com/manage/api';

/**
 * Checkout Page
 * - Creates internal order via /checkout
 * - Creates Razorpay order via /payment/create-order
 * - Opens Razorpay Checkout and verifies via /payment
 */
export default function CheckoutPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const {
    items: cartItems,
    inc,
    dec,
    remove,
    refresh,
    ensureServerCartNotEmpty,
    readGuest,
    syncGuestToServer,
    clear,
  } = useCart();

  // 🟢 NEW: ensure cart is hydrated immediately on mount (covers guest "Buy Now" navigation)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    (async () => {
      await refresh();             // loads guest items if not logged in, server items if logged in
      setHydrated(true);
    })();
  }, [refresh]);

  // Also re-hydrate if auth state changes (e.g., user logs in on this page)
  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [user, token, refresh]);

  // Refresh when tab becomes visible (lightweight, avoids double inits)
  useEffect(() => {
    const onVis = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refresh]);

  /* Totals (rupees) */
  const subtotal = cartItems.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const total = subtotal;

  /* Modals & steps */
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  // 'form' | 'select' | 'confirm'
  const [step, setStep] = useState('form');

  /* Address state */
  const [form, setForm] = useState({
    street: '', city: '',
    pincode: '', district: '', state: '', country: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [shippingId, setShippingId] = useState(null);
  const [billingId, setBillingId] = useState(null);
  const [sameAsShip, setSameAsShip] = useState(true); // billing=shipping by default
  const [deliveryMethod, setDeliveryMethod] = useState(1); // 1 std, 2 express

  /* Status */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAddrId, setNewAddrId] = useState(null);

  /* Helpers */
  const normalizeAddr = (a) => ({
    id: a.aid || a.id || a.address_id,
    doorno: a.doorno,
    house: a.house,
    street: a.street,
    city: a.city,
    pincode: a.pincode,
    district: a.district,
    state: a.state,
    country: a.country,
    company: a.company,
    gst: a.gst,
    type: a.atype || a.type,
    deflt: a.deflt,
  });

  const addrLabel = (a = {}) =>
    [a.doorno, a.house, a.street, a.city, a.district, a.state, a.country, a.pincode]
      .filter(Boolean)
      .join(', ');

  // helper to push the selected address to the top
  const ordered = (list, selectedId) => {
    const first = list.find(a => a.id === selectedId);
    const rest  = list.filter(a => a.id !== selectedId);
    return first ? [first, ...rest] : rest;
  };

  const fetchAddresses = async () => {
    try {
      const payload = qs.stringify({ userid: user.id, address_id: 1 });
      const { data } = await axios.post(
        `${API_BASE}/address`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (data.status === false) {
        Swal(data.message || 'Address not found – please add one');
        setStep('form');
        setShowAddressModal(true);
        return [];
      }
      const raw = data.data;
      const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const norm = list.map(normalizeAddr);
      setAddresses(norm);
      if (norm.length) {
        setShippingId(norm[0].id);
        setBillingId(norm[0].id);
      }
      return norm;
    } catch {
      setStep('form');
      setShowAddressModal(true);
      return [];
    }
  };

  const fetchDefaultAddresses = async () => {
    try {
      const payload = qs.stringify({ userid: user.id });
      const { data } = await axios.post(
        `${API_BASE}/address`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (data.status === false) {
        Swal(data.message || 'Address not found – please add one');
        setStep('form');
        setShowAddressModal(true);
        return [];
      }
      const raw = data.data;
      const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const norm = list.map(normalizeAddr);
      setAddresses(norm);
      if (norm.length) {
        setShippingId(norm[0].id);
        setBillingId(norm[0].id);
      }
      return norm;
    } catch {
      setStep('form');
      setShowAddressModal(true);
      return [];
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const list = await fetchDefaultAddresses();
      setStep(list.length ? 'select' : 'form');
      setShowAddressModal(true);
    } catch {
      setError('Could not load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: { lat: latitude, lon: longitude, format: 'json' },
          });
          const a = res.data.address || {};
          setForm((f) => ({
            ...f,
            street: `${a.road || ''}${a.road && ','} ${a.suburb || ''}`.trim(),
            city: a.city || a.town || a.village || f.city,
            district: a.county || f.district,
            state: a.state || f.state,
            country: a.country || f.country,
            pincode: a.postcode || f.pincode,
          }));
        } catch {
          setError('Unable to fetch address from location');
        }
      },
      () => setError('Permission denied or location unavailable')
    );
  };

  const handleAddAddress = async () => {
    for (let k of Object.keys(form)) {
      if (!String(form[k] ?? '').trim()) {
        setError(`Please fill in ${k}`);
        return;
      }
    }
    setError('');
    setLoading(true);
    try {
      const payload = qs.stringify({ userid: user.id, ...form });
      const { data } = await axios.post(`${API_BASE}/address/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const ok =
        data.success === true ||
        data.success === 'true' ||
        data.success === 1 ||
        data.success === '1' ||
        data.status === true;
      if (ok) {
        const addedObj = data.data ? normalizeAddr(data.data) : null;
        if (addedObj?.id) {
          setAddresses((prev) => [addedObj, ...prev]);
          setShippingId(addedObj.id);
          setBillingId(addedObj.id);
          setNewAddrId(addedObj.id);
        } else {
          const list = await fetchDefaultAddresses();
          const last = list[list.length - 1];
          if (last) {
            setShippingId(last.id);
            setBillingId(last.id);
            setNewAddrId(last.id);
          }
        }
        setForm({
          doorno: '',
          house: '',
          street: '',
          city: '',
          pincode: '',
          district: '',
          state: '',
          country: '',
          company: '',
          gst: '',
          type: ''
        });
        setStep('select');
      } else {
        setError(data.message || 'Failed to add address');
      }
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContinue = () => {
    const billId = sameAsShip ? shippingId : billingId;
    if (!shippingId || !billId) {
      setError('Please select both shipping and billing address');
      return;
    }
    setError('');
    setStep('confirm');
  };

  // ---------------------------
  // Razorpay Pay Click Handler
  // ---------------------------
   const handlePayClick = async (order_id) => {
    try {
      if (!order_id) throw new Error('Missing internal order id');
      setError('');
      setLoading(true);

      const payload = qs.stringify({
        order_id,
        userid: user?.id,
        client_hint_amount: Math.round(Number(total)), // paise hint (server must recompute)
        receipt: `Newspotent_${order_id}`,
        notes: JSON.stringify({ source: 'web', cart: cartItems.length }),
      });

      const { data: raw } = await axios.post(
        `${API_BASE}/payment/create-order`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            
          },
        }
      );

      // Normalize your API shape
      const res = raw?.data ?? raw ?? {};

      // Use the SAME key as the server's mode/account
      const keyId = 'rzp_test_RO7mQh61by0ER2';

      // Must be a Razorpay order id like "order_***"
      const rzpOrderId = res.porder_id;

      if (!keyId || !/^rzp_(test|live)_/.test(String(keyId))) {
        console.error('Create-order response:', res);
        throw new Error('Invalid Razorpay keyId from create-order');
      }
      if (!rzpOrderId || !String(rzpOrderId).startsWith('order_')) {
        console.error('Create-order response:', res);
        throw new Error('Invalid Razorpay order id from create-order');
      }

      // Load SDK & open checkout
      await loadRazorpay();
      if (!window.Razorpay) throw new Error('Razorpay SDK not available');

      const rzp = new window.Razorpay({
        key: keyId,            // DO NOT hard-code; must match the server's mode
        order_id: rzpOrderId,  // must be order_****
        name: 'Ikonix Perfumer',
        description: 'Order Payment',
        image: '/favicon.ico',
        prefill: {
          name:    res.customer?.name  ?? user?.name  ?? '',
          email:   res.customer?.email ?? user?.email ?? '',
          contact: res.customer?.phone ?? '',
        },
          
        theme: { color: '#b49d91' },
        handler: async (resp) => {
          try {
            const form = new FormData();
            form.append('userid', String(user.id));
            form.append('order_id', String(order_id));              // your internal id
            form.append('porder_id', resp.razorpay_order_id);       // Razorpay order_****
            form.append('payment_id', resp.razorpay_payment_id);
            form.append('signature', resp.razorpay_signature);

            const verifyRes = await fetch(`${API_BASE}/payment/callback`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              body: form,
            });
            const result = await verifyRes.json().catch(() => ({}));
          
            if (!verifyRes.ok || result?.status === false) {
              throw new Error(result?.message || 'Signature verification failed');
            }
            
            // console.log(result,'finalout')

          } catch (err) {
            setError(err.message || 'Payment verification failed');
            Swal(err)
          } finally {
            setLoading(false);
            navigate('/order-confirmation')
          }
        },
        modal: { ondismiss: () => {setLoading(false); navigate('/');} }, 
      });

      rzp.on('payment.failed', (resp) => {
        setLoading(false);
        setError(resp?.error?.description || 'Payment failed');
      });

      rzp.open();
    } catch (e) {
      setLoading(false);
      setError(e.message || 'Unable to start payment');
    }
  };

  // const handleCheckout = async () => {
  //   const billId = sameAsShip ? shippingId : billingId;
  //   try {
  //     setLoading(true);
  //     setError('');
  //     // Ensure server has items if user just logged in
  //     await ensureServerCartNotEmpty();
  //     const payload = qs.stringify({
  //       userid: user.id,
  //       shipping_address: shippingId,
  //       billing_address: billId,
  //       delivery_method: deliveryMethod,
  //     });
      
  //     const doCheckout = () =>
  //       axios.post(`${API_BASE}/checkout`, payload, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //         },
  //       });
  //     let { data } = await doCheckout();
  //     const needRetry =
  //       data?.status === false &&
  //       typeof data?.message === 'string' &&
  //       data.message.toLowerCase().includes('no products added');
  //     if (needRetry) {
  //       await syncGuestToServer(readGuest());
  //       await refresh();
  //       const second = await doCheckout();
  //       data = second.data;
  //     }
  //     if (data?.status === true) {
  //       setShowAddressModal(false);
  //       handlePayClick(data.order_id);
  //     } else {
  //       setError(data?.message || 'Checkout failed, please try again');
  //     }
  //   } catch {
  //     setError('Checkout failed, please try again');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCheckout = async () => {
  try {
    setLoading(true);
    setError('');

    // Auth guard
    if (!user || !token) {
      setLoading(false);
      setShowAuthModal(true);
      return;
    }

    // Address guards
    const shipId = Number(shippingId);
    const billId = Number(sameAsShip ? shippingId : billingId);
    if (!shipId || !billId) {
      setLoading(false);
      setError('Please select both shipping and billing address');
      return;
    }

    // Helper: how many items are on server cart now?
    const getServerCount = async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE}/cart`,
          qs.stringify({ userid: user.id }),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        const list = Array.isArray(data?.data) ? data.data : [];
        return list.length;
      } catch {
        return -1; // unknown
      }
    };

    // Ensure server has items (handles guest→login)
    let serverCount = await getServerCount();
    if (serverCount === 0) {
      // drain guest → server
      await syncGuestToServer(readGuest());
      await refresh();
      serverCount = await getServerCount();
    }

    const payload = qs.stringify({
      userid: String(user.id),
      shipping_address: String(shipId),
      billing_address: String(billId),
      delivery_method: Number(deliveryMethod) || 1,
    });

    const doCheckout = () =>
      axios.post(`${API_BASE}/checkout`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 20000,
      });

    // First attempt
    let resp;
    try {
      resp = await doCheckout();
    } catch (err) {
      const msg = String(
        err?.response?.data?.message || err?.message || ''
      ).toLowerCase();

      // If backend says "no products added", try syncing guest once more
      if (msg.includes('no products added')) {
        await syncGuestToServer(readGuest());
        await refresh();
        resp = await doCheckout();
      } else {
        throw err;
      }
    }

    const data = resp?.data;
    const ok =
      data?.status === true ||
      data?.success === true ||
      data?.status === 'true' ||
      data?.success === 'true';

    if (ok && data?.order_id) {
      setShowAddressModal(false);
      await handlePayClick(data.order_id);
      return;
    }

    throw new Error(data?.message || 'Checkout failed, please try again');

  } catch (err) {
    const apiMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Checkout failed, please try again';
    setError(apiMsg);
    console.error('Checkout error:', {
      message: apiMsg,
      status: err?.response?.status,
      data: err?.response?.data,
    });
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    setShowAddressModal(false);
    setStep('form');
    setError('');
    setNewAddrId(null);
  };

  const QtyBox = ({ value, onDec, onInc }) => (
    <div className="flex items-center border border-black rounded-[12px] px-4 py-2  text-sm">
      <button className="px-2 disabled:opacity-30" onClick={onDec} disabled={Number(value) <= 1}>
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="mx-3">{Number(value)}</span>
      <button className="px-2" onClick={onInc}>
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );

  const CloseBtn = ({ onClick }) => (
    <button onClick={onClick} className="absolute right-6 top-6 p-1 rounded-full hover:bg-gray-100" aria-label="close">
      <XMarkIcon className="w-5 h-5" />
    </button>
  );

  // 🟢 NEW: avoid showing "empty cart" flash before first hydration completes
  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-4xl font-semibold mb-8 text-[#194463]">Your Order</h1>
        <p className="text-center">Loading your cart…</p>
      </div>
    );
  }

  return (
   <div className="max-w-7xl mx-auto py-10 px-6 text-black font-['Inter',sans-serif]">
  {/* PAGE HEADER */}
  <h1 className="text-4xl font-semibold mb-10 text-[#1f567c] border-b pb-3">
    Your Order
  </h1>

  {cartItems.length === 0 ? (
    <div className="text-center py-20">
      <p className="text-lg text-black/80">
        Your cart is empty.&nbsp;
        <button
          onClick={() => navigate("/shop")}
          className="underline text-[#1f567c] font-medium"
        >
          Continue Shopping
        </button>
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* LEFT: CART ITEMS */}
      <div className="lg:col-span-2 space-y-8">
        {cartItems.map((item) => (
          <div
            key={item.cartid}
            className="grid lg:flex gap-5 border border-black/10 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            <img
              src={`https://thenewspotent.com/manage/assets/uploads/${item.image}`}
              alt={item.name}
              className="w-full lg:w-40 rounded-lg object-cover border border-black/10"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#1f567c]">
                  {item.name}
                </h3>
                <p className="text-base font-medium text-black/70">
                  ₹{Number(item.price).toFixed(2)}
                </p>
              </div>
              <div className="grid lg:flex gap-2 items-center justify-between">
                <QtyBox
                  value={item.qty}
                  onDec={() => dec(item.cartid, item.id, item.variantid)}
                  onInc={() => inc(item.cartid, item.id, item.variantid)}
                />
                <button
                  onClick={() =>
                    remove(item.cartid, item.id, item.variantid)
                  }
                  className="text-sm text-[#1f567c] underline text-left md:text-center"
                >
                  Remove
                </button>
              </div>
            </div>
            {/* <div className="text-right font-semibold text-black">
              ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
            </div> */}
          </div>
        ))}
      </div>

      {/* RIGHT: SUMMARY */}
      <div className="border border-black/10 rounded-2xl p-6 h-fit sticky top-20 shadow-md bg-white">
        <h2 className="text-2xl font-semibold text-[#1f567c] mb-6">
          Order Summary
        </h2>
        <div className="space-y-3 text-black/80 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-2 text-lg font-semibold text-black">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full mt-8 py-3 rounded-xl bg-[#1f567c] text-white font-medium text-lg hover:opacity-90 transition-all"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  )}

  {/* AUTH MODAL */}
  <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

  {/* CHECKOUT POPUP */}
  {showAddressModal && (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/10">
        {/* Header */}
        <div className="bg-[#1f567c] text-white px-8 py-5 flex justify-between items-center">
          <h2 className="text-2xl font-semibold uppercase tracking-wide">
            Checkout
          </h2>
          <button
            onClick={handleCancel}
            className="text-2xl hover:opacity-80 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-2 md:p-4 lg:p-8 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Address Form */}
          {step === "form" && (
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-black">
                Shipping Details
              </h3>

              <button
                onClick={handleUseLocation}
                className="mb-6 inline-flex items-center gap-2 px-5 py-3 bg-[#1f567c] text-white rounded-lg hover:opacity-90"
              >
                <span className="material-icons text-base">my_location</span>
                Use My Location
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  ["street", "Street"],
                  ["city", "City"],
                  ["pincode", "Pincode"],
                  ["district", "District"],
                  ["state", "State"],
                  ["country", "Country"],
                ].map(([k, label]) => (
                  <div key={k} className="flex flex-col">
                    <label className="text-sm mb-1">{label}</label>
                    <input
                      name={k}
                      value={form[k]}
                      onChange={handleChange}
                      placeholder={label}
                      className="border border-black/40 rounded-lg px-4 py-2 focus:border-[#1f567c] focus:ring-1 focus:ring-[#1f567c] outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-10 flex justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="px-10 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleAddAddress}
                  className="px-10 py-3 bg-[#1f567c] text-white rounded-lg hover:opacity-90"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Address */}
          {step === "select" && (
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-black">
                Select Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping */}
                <div>
                  <h4 className="text-lg font-semibold text-[#1f567c] mb-4 border-b border-black/10 pb-1">
                    Shipping Address
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {ordered(addresses, shippingId).map((a) => (
                      <label
                        key={a.id}
                        className={`block border rounded-xl p-4 text-sm cursor-pointer transition ${
                          shippingId === a.id
                            ? "border-[#1f567c] ring-2 ring-[#1f567c]/30"
                            : "border-black/20"
                        }`}
                      >
                        <div className="flex gap-3">
                          <input
                            type="radio"
                            className="accent-[#1f567c]"
                            name="shipping"
                            checked={shippingId === a.id}
                            onChange={() => {
                              setShippingId(a.id);
                              if (sameAsShip) setBillingId(a.id);
                            }}
                          />
                          <div>{addrLabel(a)}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep("form")}
                    className="mt-5 w-full border border-[#1f567c] text-[#1f567c] py-3 rounded-lg hover:bg-[#1f567c] hover:text-white transition"
                  >
                    + Add New
                  </button>
                </div>

                {/* Billing */}
                <div>
                  <h4 className="text-lg font-semibold text-[#1f567c] mb-4 border-b border-black/10 pb-1">
                    Billing Address
                  </h4>
                  <label className="flex items-center gap-2 text-sm mb-4">
                    <input
                      type="checkbox"
                      className="accent-[#1f567c]"
                      checked={sameAsShip}
                      onChange={(e) => {
                        setSameAsShip(e.target.checked);
                        if (e.target.checked) setBillingId(shippingId);
                      }}
                    />
                    Same as shipping
                  </label>
                  {!sameAsShip && (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {ordered(addresses, billingId).map((a) => (
                        <label
                          key={a.id}
                          className={`block border rounded-xl p-4 text-sm cursor-pointer transition ${
                            billingId === a.id
                              ? "border-[#1f567c] ring-2 ring-[#1f567c]/30"
                              : "border-black/20"
                          }`}
                        >
                          <div className="flex gap-3">
                            <input
                              type="radio"
                              className="accent-[#1f567c]"
                              name="billing"
                              checked={billingId === a.id}
                              onChange={() => setBillingId(a.id)}
                            />
                            <div>{addrLabel(a)}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button
                  onClick={handleCancel}
                  className="px-10 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSelectContinue}
                  className="px-10 py-3 bg-[#1f567c] text-white rounded-lg hover:opacity-90"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
        {step === "confirm" && (
  <div className="pb-6">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-black/10 pb-4">
      <h3 className="text-2xl md:text-3xl font-semibold text-[#1f567c] tracking-wide">
        Order Review
      </h3>
      <p className="text-sm text-black/60 mt-2 md:mt-0">
        Review your items and address before placing the order
      </p>
    </div>

    {/* Main grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
      {/* --- LEFT: PRODUCTS --- */}
      <div className="lg:col-span-2 order-2 lg:order-1">
        <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-5 bg-[#1f567c] rounded-sm" />
            Products
          </h4>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 sm:pr-2">
            {cartItems.map((item) => (
              <div
                key={item.cartid}
                className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-black/5 pb-4 last:border-none"
              >
                <img
                  src={`https://thenewspotent.com/manage/assets/uploads/${item.image}`}
                  alt={item.name}
                  className="w-40 sm:w-20 rounded-lg object-cover border border-black/10 sm:mx-0"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-black text-base sm:text-lg">
                    {item.name}
                  </p>
                  <p className="text-[#1f567c] font-semibold text-sm mt-1">
                    ₹{item.price} × {item.qty}
                  </p>
                </div>
                <p className="text-black font-semibold sm:text-right text-sm sm:text-base">
                  ₹{(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RIGHT: SUMMARY CARD --- */}
      <div className="lg:col-span-1 order-1 lg:order-2">
        <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-5 sm:p-6 space-y-6">
          {/* Address */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-black mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-5 bg-[#1f567c] rounded-sm" />
              Shipping Address
            </h4>
            <div className="border border-black/10 rounded-xl p-3 sm:p-4 text-sm text-black leading-snug">
              {addrLabel(addresses.find((a) => a.id === shippingId))}
            </div>
          </div>

          {/* Price Summary */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-black mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-5 bg-[#1f567c] rounded-sm" />
              Order Summary
            </h4>
            <div className="space-y-3 text-sm sm:text-base text-black/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr className="border-black/10" />
              <div className="flex justify-between text-lg sm:text-xl font-bold text-[#1f567c]">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Secure note */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-black/60 border-t border-black/10 pt-3">
            {/* <span className="material-icons text-[#1f567c] text-sm">lock</span> */}
            <p>Payments are secured and encrypted.</p>
          </div>
        </div>
      </div>
    </div>

    {/* --- BUTTONS --- */}
    <div className="flex flex-col sm:flex-row justify-end sm:justify-between lg:justify-end gap-3 sm:gap-4 mt-10 border-t border-black/10 pt-6">
      <button
        onClick={() => setStep("select")}
        className="w-full sm:w-auto px-8 sm:px-10 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-all duration-200"
      >
        Back
      </button>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full sm:w-auto px-8 sm:px-10 py-3 bg-[#1f567c] text-white rounded-lg hover:opacity-90 transition-all duration-200"
      >
        {loading ? "Processing…" : "Place Order"}
      </button>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  )}
</div>

  );
}
