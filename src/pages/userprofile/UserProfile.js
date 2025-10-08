// src/pages/account/UserProfile.js
import React, { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function UserProfile() {
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
    // setToken('');
    navigate('/');
  };

  const copyToClipboard = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn('Clipboard copy failed', e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading…
      </div>
    );
  }

  const masked = (str = '') =>
    str.length <= 8 ? '********' : `${str.slice(0, 4)}…${str.slice(-4)}`;

  return (
   <div className="min-h-[80%] bg-gradient-to-br from-[#E3F2FD] to-white flex items-center justify-center px-6 py-12">
  <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8">

    {/* Left Panel - Profile Overview */}
    <div className="flex-1 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 flex flex-col items-center border">
      <div className="relative">
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt="Profile Avatar"
          className="w-28 h-28 rounded-full border-4 border-white shadow-md"
        />
        <button
          onClick={handleLogout}
          className="absolute bottom-0 right-0 bg-[#2972A5] text-white text-xs px-3 py-1.5 rounded-full shadow hover:bg-[#194463] transition"
        >
          Logout
        </button>
      </div>

      <h1 className="mt-5 text-2xl font-semibold text-[#194463] font-[luxia] tracking-tight">
        {user.name || "Guest User"}
      </h1>
      <p className="text-[#2972A5] text-sm mt-1">{user.email || "No email provided"}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <div className="bg-white/60 border border-[#dce8f3] rounded-2xl p-4 text-center">
          <p className="text-sm">User ID</p>
          <p className="font-semibold text-[#194463] mt-1">{user.id}</p>
        </div>
        <div className="bg-white/60 border border-[#dce8f3] rounded-2xl p-4 text-center">
          <p className="text-sm ">Mobile</p>
          <p className="font-semibold text-[#194463] mt-1">{user.mobile || "—"}</p>
        </div>
      </div>

      {/* Token Visibility */}
      <div className="mt-6 w-full">
        <div className="bg-white/60 border border-[#dce8f3] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm">Access Token</p>
            <p className="font-mono text-sm text-[#194463] truncate w-40">
              {showToken ? user.token : "••••••••••••••"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowToken(!showToken)}
              className="text-[#2972A5] text-xs underline hover:text-[#194463]"
            >
              {showToken ? "Hide" : "Show"}
            </button>
            <button
              onClick={() => copyToClipboard(user.token)}
              className="text-[#2972A5] text-xs underline hover:text-[#194463]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Right Panel - Quick Actions / Links */}
    <div className="flex-1 flex flex-col gap-6">
      {/* Profile Summary Card */}
      <div className="bg-[#194463] text-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
        <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-[#2972A5]/30 rounded-full blur-3xl" />
        <h2 className="text-2xl font-semibold mb-2">Welcome Back 👋</h2>
        <p className="text-white/80 text-sm mb-6">
          Manage your orders, addresses, and personal details from one place.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="bg-white text-[#194463] px-2 py-1 lg:px-4 lg:py-2 rounded-xl font-medium shadow hover:bg-[#e6eef4] transition"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/addresses")}
            className="border border-white/70 px-1 py-2 lg:px-4 lg:py-2 rounded-xl text-white hover:bg-white/10 transition"
          >
            Manage Addresses
          </button>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/orders"
          className="bg-white/70 backdrop-blur-xl border border-[#dce8f3] rounded-2xl p-6 hover:shadow-lg transition flex flex-col items-start"
        >
          <span className="text-[#194463] font-semibold text-lg mb-1">🛍 My Orders</span>
          <p className="text-sm text-[#6d5a52]/70">Check your purchase history and order status</p>
        </Link>

        <Link
          to="/addresses"
          className="bg-white/70 backdrop-blur-xl border border-[#dce8f3] rounded-2xl p-6 hover:shadow-lg transition flex flex-col items-start"
        >
          <span className="text-[#194463] font-semibold text-lg mb-1">📍 My Addresses</span>
          <p className="text-sm text-[#6d5a52]/70">Add or edit your delivery locations</p>
        </Link>

        {/* Example future card */}
        {/* <Link
          to="/wishlist"
          className="bg-white/70 backdrop-blur-xl border border-[#dce8f3] rounded-2xl p-6 hover:shadow-lg transition flex flex-col items-start"
        >
          <span className="text-[#194463] font-semibold text-lg mb-1">❤️ Wishlist</span>
          <p className="text-sm text-[#6d5a52]/70">Your saved favorites</p>
        </Link> */}
      </div>
    </div>
  </div>
</div>

  );
}

/* ---------- Small sub components ---------- */

function Row({ label, value, copyable = false, onCopy, copied }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
      <span className="font-medium text-[#194463]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="break-all">{value}</span>
        {copyable && (
          <button
            onClick={() => onCopy(value)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Copy"
          >
            <ClipboardDocumentIcon className="w-4 h-4 text-[#194463]" />
          </button>
        )}
        {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
      </div>
    </div>
  );
}

function TokenRow({ label, value, show, onToggle, onCopy, copied }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
      <span className="font-medium text-[#194463]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="break-all">
          {show ? value : masked(value)}
        </span>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded"
          title={show ? 'Hide' : 'Show'}
        >
          {show ? (
            <EyeSlashIcon className="w-4 h-4 text-[#194463]" />
          ) : (
            <EyeIcon className="w-4 h-4 text-[#194463]" />
          )}
        </button>
        <button
          onClick={() => onCopy(value)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Copy token"
        >
          <ClipboardDocumentIcon className="w-4 h-4 text-[#194463]" />
        </button>
        {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
      </div>
    </div>
  );
}

/* Quick link card */
function QuickLink({ to, title }) {
  return (
    <Link
      to={to}
      className="bg-white border border-[#194463] rounded-2xl px-6 py-5 text-[#194463] hover:shadow-md transition flex items-center justify-between text-sm font-medium"
    >
      {title}
      <span className="text-[#194463]">→</span>
    </Link>
  );
}

/* util */
function masked(str = '') {
  return str.length <= 8 ? '********' : `${str.slice(0, 4)}…${str.slice(-4)}`;
}