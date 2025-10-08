import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import qs from "qs";

const API_BASE = "https://thenewspotent.com/manage/api";
const API_BASE_IMG = "https://thenewspotent.com/manage/";

function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_BASE}/orders`,
        qs.stringify({
          userid: user.id,
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setOrders(response.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll to show more orders (frontend lazy load)
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >=
      document.documentElement.scrollHeight
    ) {
      setVisibleCount((prev) => prev + 5);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
   <div className="w-[80%] mx-auto mt-4 space-y-8">
  {/* Breadcrumb */}
  <nav className="text-sm text-gray-500 flex items-center space-x-1">
    <Link to="/user-profile" className="hover:text-[#1f567c] font-medium">
      Profile
    </Link>
    <span>/</span>
    <span className="text-gray-700 font-medium">Orders</span>
  </nav>

  {/* Header */}
  <div className="flex items-center justify-between border-b pb-3">
    <h2 className="text-2xl font-semibold text-[#1f567c]">My Orders</h2>
    <p className="text-sm text-gray-500">
      Showing {orders.length} order{orders.length !== 1 && "s"}
    </p>
  </div>

  {/* Orders List */}
  <div className="relative border-l-2 border-gray-200 pl-4">
    {orders.slice(0, visibleCount).map((order, id) => (
      <div key={id} className="relative mb-10">
        {/* Timeline Dot
        <div className="absolute -left-[11px] top-2 w-5 h-5 bg-[#1f567c] rounded-full border-2 border-white shadow"></div> */}

        {/* Order Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 ml-4 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{order.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {order.category} | {order.date}
              </p>
            </div>
            <img
              src={`${API_BASE_IMG}/assets/uploads/${order.image}`}
              alt={order.name}
              className="w-16 h-16 rounded-md object-cover"
            />
          </div>

          {/* Order Details Row */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-500">Price</p>
              <p>₹{order.price}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Quantity</p>
              <p>{order.qty}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Delivery</p>
              <p>{order.delivery}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Charge</p>
              <p>₹{order.delivery_charge}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Status</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Expandable Address */}
          <details className="mt-5 bg-gray-50 rounded-lg p-3 text-sm group open:shadow-inner">
            <summary className="cursor-pointer font-medium text-[#1f567c] flex items-center justify-between">
              View Address
              <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-3 space-y-2 text-gray-700">
              <div>
                <p className="font-medium">Billing Address</p>
                <p>{order.billing_address}</p>
              </div>
              <div>
                <p className="font-medium">Delivery Address</p>
                <p>{order.delivery_address}</p>
              </div>
            </div>
          </details>
        </div>
      </div>
    ))}
  </div>

  {/* States */}
  {loading && (
    <p className="text-gray-500 text-center mt-6">Loading your orders...</p>
  )}
  {error && <p className="text-red-500 text-center">{error}</p>}
  {!loading && orders.length === 0 && (
    <p className="text-gray-500 text-center">No orders found.</p>
  )}
</div>

  );
}

export default Orders;