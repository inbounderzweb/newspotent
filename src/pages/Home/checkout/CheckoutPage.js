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

const API_BASE = 'https://ikonixperfumer.com/beta/api';

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

  // Refresh when tab becomes visible (lightweight, avoids double inits)
  useEffect(() => {
    const onVis = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refresh]);

  /* Totals (rupees) */
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
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
        receipt: `ikonix_${order_id}`,
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
      const keyId = 'rzp_test_R8MrWyxyABfzGy';

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
        key: keyId,
        order_id: rzpOrderId,
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
            form.append('order_id', String(order_id));
            form.append('porder_id', resp.razorpay_order_id);
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
          } catch (err) {
            setError(err.message || 'Payment verification failed');
            Swal(err);
          } finally {
            setLoading(false);
            navigate('/order-confirmation');
          }
        },
        modal: { ondismiss: () => { setLoading(false); navigate('/'); } },
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

  const handleCheckout = async () => {
    const billId = sameAsShip ? shippingId : billingId;
    try {
      setLoading(true);
      setError('');
      await ensureServerCartNotEmpty();
      const payload = qs.stringify({
        userid: user.id,
        shipping_address: shippingId,
        billing_address: billId,
        delivery_method: deliveryMethod,
      });
      const doCheckout = () =>
        axios.post(`${API_BASE}/checkout`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      let { data } = await doCheckout();
      const needRetry =
        data?.status === false &&
        typeof data?.message === 'string' &&
        data.message.toLowerCase().includes('no products added');
      if (needRetry) {
        await syncGuestToServer(readGuest());
        await refresh();
        const second = await doCheckout();
        data = second.data;
      }
      if (data?.status === true) {
        setShowAddressModal(false);
        handlePayClick(data.order_id);
      } else {
        setError(data?.message || 'Checkout failed, please try again');
      }
    } catch {
      setError('Checkout failed, please try again');
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
    <div className="flex items-center border border-[#6d5a52] rounded-[12px] px-4 py-2 text-[#6d5a52] text-sm">
      <button className="px-2 disabled:opacity-30" onClick={onDec} disabled={value <= 1}>
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="mx-3">{value}</span>
      <button className="px-2" onClick={onInc}>
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );

  const CloseBtn = ({ onClick }) => (
    <button onClick={onClick} className="absolute right-6 top-6 p-1 rounded-full hover:bg-gray-100" aria-label="close">
      <XMarkIcon className="w-5 h-5 text-[#6d5a52]" />
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-semibold mb-8 text-[#194463]">Your Order</h1>

      {cartItems.length === 0 ? (
        <p className="text-center">
          Your cart is empty.&nbsp;
          <button onClick={() => navigate('/shop')} className="underline text-[#194463]">
            Continue Shopping
          </button>
        </p>
      ) : (
        <>
          {/* Header row */}
          <div className="grid grid-cols-12 text-[#194463] rounded-md py-3 px-4 font-semibold mb-4 text-lg">
            <div className="col-span-7">product</div>
            <div className="col-span-3 text-center">QTY</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Items */}
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.cartid} className="flex flex-col gap-4 md:grid md:grid-cols-12 md:items-center">
                {/* Product */}
                <div className="flex items-center gap-4 md:col-span-7">
                  <img
                    src={`https://thenewspotent.com/manage/assets/uploads/${item.image}`}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-xl text-[#194463] font-medium">{item.name}</p>
                    <p className="text-[#194463] text-lg font-semibold">Rs.{item.price.toFixed(2)}/-</p>
                  </div>
                </div>

                {/* Qty */}
                <div className="flex justify-between md:justify-center md:col-span-3">
                  <QtyBox
                    value={item.qty}
                    onDec={() => dec(item.cartid, item.id, item.variantid)}
                    onInc={() => inc(item.cartid, item.id, item.variantid)}
                  />
                  <button
                    onClick={() => remove(item.cartid, item.id, item.variantid)}
                    className="underline text-[#194463] text-sm ml-4 md:hidden"
                  >
                    Remove
                  </button>
                </div>

                {/* Total & Remove on md+ */}
                <div className="flex justify-between md:justify-end md:col-span-2 items-center">
                  <p className="text-[#194463] font-semibold text-lg">
                    Rs.{(item.price * item.qty).toFixed(2)}/-
                  </p>
                  <button
                    onClick={() => remove(item.cartid, item.id, item.variantid)}
                    className="underline text-[#194463] text-sm hidden md:inline-block ml-4"
                  >
                    Remove
                  </button>
                </div>

                <div className="col-span-12 border-b mt-6" />
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-10 flex justify-end text-[#194463]">
            <div className="w-1/2 max-w-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-base">Subtotal</span>
                <span className="text-[#194463] font-semibold">
                  Rs.{subtotal.toFixed(2)}/-
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#194463]">
                <span>Total</span>
                <span>Rs.{total.toFixed(2)}/-</span>
              </div>
            </div>
          </div>

          {/* Place order */}
          <div className="flex justify-center mt-10">
            <button
              onClick={handlePlaceOrder}
              className="bg-[#194463] text-white text-lg px-16 py-4 rounded-xl hover:opacity-90 transition"
            >
              Place order
            </button>
          </div>
        </>
      )}

      {/* Auth modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative bg-[#fdf8f5] w-full lg:max-w-[90%] rounded-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
            <CloseBtn onClick={handleCancel} />

            {/* STEP: FORM */}
            {step === 'form' && (
              <>
                <h2 className="text-3xl font-semibold text-[#194463] mb-6">Enter Shipping Address</h2>

                <button
                  onClick={handleUseLocation}
                  className="mb-6 inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl bg-[#194463] hover:opacity-90"
                >
                  <span className="material-icons text-base">my_location</span>
                  Use my Location
                </button>

                <hr className="mb-6 border-[#194463]" />

                <div className="grid grid-cols-2 gap-4 text-[#194463]">
                  {[
                    ['street','Street'],
                    ['city','City'], ['pincode','Pincode'], ['district','District'],
                    ['state','State'], ['country','Country'],
                  ].map(([k, l]) => (
                    <div key={k} className="flex flex-col gap-1">
                      <label className="text-sm">{l}</label>
                      <input
                        name={k}
                        value={form[k]}
                        onChange={handleChange}
                        className="border border-[#194463] rounded-xl px-4 py-2 bg-transparent"
                        placeholder={l}
                      />
                    </div>
                  ))}
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                <div className="mt-10 flex justify-end gap-4">
                  <button
                    onClick={handleCancel}
                    className="px-10 py-3 rounded-xl border border-[#194463] text-[#194463]"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="px-10 py-3 rounded-xl bg-[#1e2633] text-white hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Continue'}
                  </button>
                </div>
              </>
            )}

            {/* STEP: SELECT */}
            {step === 'select' && (
              <>
                <h2 className="text-3xl font-semibold text-[#6d5a52] mb-8">Choose Address</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping */}
                  <div>
                    <h3 className="text-xl font-semibold text-[#194463] px-4 py-2 rounded-md inline-block mb-4">
                      Shipping Address
                    </h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {ordered(addresses, shippingId).map(a => (
                        <label
                          key={a.id}
                          className={`block border rounded-2xl p-4 cursor-pointer text-sm leading-snug
                            ${shippingId === a.id ? 'border-[#194463] bg-white' : 'border-[#194463] bg-white'}
                            ${newAddrId === a.id ? 'ring-2 ring-[#194463]' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              className="mt-1 accent-[#1e2633]"
                              name="shipping"
                              checked={shippingId === a.id}
                              onChange={() => {
                                setShippingId(a.id);
                                if (sameAsShip) setBillingId(a.id);
                              }}
                            />
                            <div>
                              {addrLabel(a)}
                              {a.company && <div>Company: {a.company}</div>}
                              {a.gst && <div>GST: {a.gst}</div>}
                              {a.type && <div>Type: {a.type}</div>}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => { setStep('form'); setNewAddrId(null); }}
                      className="mt-6 w-full bg-white text-[#194463] py-4 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">+</span> Add New
                    </button>
                  </div>

                  {/* Billing */}
                  <div>
                    <h3 className="text-xl font-semibold text-[#194463] px-4 py-2 rounded-md inline-block mb-4">
                      Billing Address
                    </h3>
                    <label className="flex items-center gap-2 text-sm text-[#194463] mb-4">
                      <input
                        type="checkbox"
                        className="accent-[#194463]"
                        checked={sameAsShip}
                        onChange={(e) => {
                          setSameAsShip(e.target.checked);
                          if (e.target.checked) setBillingId(shippingId);
                        }}
                      />
                      Billing address same as shipping
                    </label>
                    {!sameAsShip && (
                      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {ordered(addresses, billingId).map(a => (
                          <label
                            key={a.id}
                            className={`block border rounded-2xl p-4 cursor-pointer text-sm leading-snug
                              ${billingId === a.id ? 'border-[#194463] bg-white' : 'border-[#194463]'}
                              ${newAddrId === a.id ? 'ring-2 ring-[#194463]' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                className="mt-1 accent-[#194463]"
                                name="billing"
                                checked={billingId === a.id}
                                onChange={() => setBillingId(a.id)}
                              />
                              <div>
                                {addrLabel(a)}
                                {a.company && <div>Company: {a.company}</div>}
                                {a.gst && <div>GST: {a.gst}</div>}
                                {a.type && <div>Type: {a.type}</div>}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => { setStep('form'); setNewAddrId(null); }}
                      className="mt-6 w-full  text-[#194463] py-4 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">+</span> Add New
                    </button>
                  </div>
                </div>

                <hr className="my-8 border-[#194463]" />

                <div className="grid justify-between lg:flex items-center">
                  {/* Delivery method */}
                  <div className="flex items-center gap-3 m-2">
                    <h4 className="text-20px lg:text-xl font-semibold text-[#194463]">
                      Delivery Method
                    </h4>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(Number(e.target.value))}
                      className="border border-[#194463] rounded-xl px-6 py-3 text-[#194463] bg-transparent"
                    >
                      <option value={1}>Standard</option>
                      <option value={2}>Express</option>
                    </select>
                  </div>

                  <div className="flex gap-3 m-2 ml-[-10px] lg:ml-0 float-start lg:float-end justify-between">
                    <button
                      onClick={handleCancel}
                      className="px-12 py-3 rounded-xl border border-[#194463] text-[#194463]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSelectContinue}
                      className="px-12 py-3 rounded-xl bg-[#1e2633] text-white hover:opacity-90"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP: CONFIRM */}
            {step === 'confirm' && (
              <>
                <h2 className="text-3xl font-semibold text-[#194463] mb-8">Confirm your Order</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Products list */}
                  <div>
                    <div className=" text-[#194463] rounded-md py-3 px-4 font-semibold mb-4 text-lg">
                      product
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-2 space-y-6">
                      {cartItems.map((item) => (
                        <div key={item.cartid} className="flex gap-4">
                          <img
                            src={`https://thenewspotent.com/manage/assets/uploads/${item.image}`}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover bg-[#f6ebe6]"
                          />
                          <div className="flex-1">
                            <p className="text-[#6d5a52] font-medium">{item.name}</p>
                            <p className="text-[#2A3443] font-semibold text-sm">
                              Rs.{item.price.toFixed(2)}/-
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address + totals */}
                  <div>
                    <div className=" text-[#194463] rounded-md py-3 px-4 font-semibold mb-4 text-lg">
                      Address
                    </div>
                    <label className="block border border-[#194463] rounded-2xl p-4 text-sm leading-snug text-[#194463] mb-8">
                      <div className="flex items-start gap-3">
                        <input type="radio" className="mt-1 accent-[#194463]" checked readOnly />
                        <div>
                          {addrLabel(addresses.find(a => a.id === shippingId))}
                          {shippingId && billingId && (
                            <>
                              {addresses.find(a => a.id === shippingId)?.company && (
                                <div>
                                  Company: {addresses.find(a => a.id === shippingId)?.company}
                                </div>
                              )}
                              {addresses.find(a => a.id === shippingId)?.gst && (
                                <div>
                                  GST: {addresses.find(a => a.id === shippingId)?.gst}
                                </div>
                              )}
                              {addresses.find(a => a.id === shippingId)?.type && (
                                <div>
                                  Type: {addresses.find(a => a.id === shippingId)?.type}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                    <div className="space-y-2 text-[#194463] mb-8">
                      <div className="flex justify-between text-base">
                        <span>Subtotal</span>
                        <span className="text-[#194463] font-semibold">
                          Rs.{subtotal.toFixed(2)}/-
                        </span>
                      </div>
                      <div className="flex justify-between text-2xl font-bold text-[#2A3443]">
                        <span>Total</span>
                        <span>Rs.{total.toFixed(2)}/-</span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setStep('select')}
                    className="px-12 py-3 rounded-xl border border-[#194463] text-[#194463]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="px-12 py-3 rounded-xl bg-[#194463] text-white hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? 'Processing…' : 'Proceed to Checkout'}
                  </button>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setStep('select')}
                    className="px-12 py-3 rounded-xl border border-[#194463] text-[#194463]"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
