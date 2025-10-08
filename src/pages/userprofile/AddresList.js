import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import qs from "qs";

const API_BASE = "https://thenewspotent.com/manage/api";

function AddresList() {
  const { user, token } = useAuth();
  const [address, setAddress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchAddress();
    }
  }, [user]);

  const fetchAddress = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_BASE}/address`,
        qs.stringify({ userid: user.id }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setAddress(response.data.data || []);
    } catch (err) {
      console.error("Error fetching address:", err);
      setError("Failed to load your addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Lazy load more on scroll
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

  // Open edit modal
  const handleEdit = (addr) => {
    setSelectedAddress(addr);
    setFormData({ ...addr });
    setIsEditOpen(true);
  };

  // Handle form change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit edit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const response =  await axios.post(
        `${API_BASE}/address/edit`,
        qs.stringify({
          userid: user.id,
          address_id: selectedAddress.address_id,
          doorno: formData.doorno,
          house: formData.house,
          street: formData.street,
          city: formData.city,
          pincode: formData.pincode,
          district: formData.district,
          state: formData.state,
          country: formData.country,
          company: formData.company,
          gst: formData.gst,
          type: formData.type,
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setIsEditOpen(false);
      alert(response.data.message,'address edit response')
      fetchAddress(); // refresh addresses
    } catch (err) {
      console.error("Error editing address:", err);
      alert("Failed to update address. Please try again.");
    }
  };



const handleDelete = async (addr) => {
  try {
    const response = await axios.post(
      `${API_BASE}/address/delete`,
      qs.stringify({
        userid: user.id,
        address_id: addr.aid,   // use actual id here
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    alert(response.data.message || "Address deleted");
    fetchAddress(); // refresh addresses
  } catch (err) {
    console.error("Error deleting address:", err);
    alert("Failed to delete address. Please try again.");
  }
};






  return (
   <div className="min-h-screen py-12 px-4">
  <div className="max-w-5xl mx-auto">
    {/* Breadcrumb */}
    <nav className="text-sm mb-8 flex items-center gap-2">
      <Link to="/user-profile" className="hover:underline">
        Profile
      </Link>
      <span>/</span>
      <span className="">Address</span>
    </nav>

    {/* Heading */}
    <h1 className="text-3xl font-semibold text-[#2A3443] mb-10 tracking-wide">
      Saved Addresses
    </h1>

    {/* Address Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {address.slice(0, visibleCount).map((addr, id) => (
        <div
          key={id}
          className="relative bg-white border  rounded-2xl shadow-sm hover:shadow-md transition-all p-6 hover:-translate-y-[2px]"
        >
          {/* Floating Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => handleEdit(addr)}
              className=" text-[#2A3443] px-3 py-1.5 rounded-lg text-sm border-[1px] border-slate-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(addr)}
              className="bg-[#FCE8E6] text-[#B43E3E] px-3 py-1.5 rounded-lg text-sm hover:bg-[#f5d5d3] transition"
            >
              Delete
            </button>
          </div>

          {/* Address Content */}
          <div className=" space-y-1 mt-2">
            <p className="text-lg font-semibold text-[#2A3443] mb-3">
              Address ID: {addr.address_id}
            </p>
            <p className="text-sm">
              <span className="font-medium">Door No:</span> {addr.doorno}
            </p>
            <p className="text-sm">
              <span className="font-medium">House:</span> {addr.house}
            </p>
            <p className="text-sm">
              <span className="font-medium">Street:</span> {addr.street}
            </p>
            <p className="text-sm">
              <span className="font-medium">City:</span> {addr.city} - {addr.pincode}
            </p>
            <p className="text-sm">
              <span className="font-medium">District:</span> {addr.district} - {addr.state}
            </p>
            <p className="text-sm">
              <span className="font-medium">Country:</span> {addr.country}
            </p>
            {addr.company && (
              <p className="text-sm">
                <span className="font-medium">Company:</span> {addr.company}
              </p>
            )}
            {addr.gst && (
              <p className="text-sm">
                <span className="font-medium">GST:</span> {addr.gst}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* States */}
    {loading && (
      <p className="text-center mt-6">
        Loading your addresses...
      </p>
    )}
    {error && <p className="text-center text-red-500 mt-6">{error}</p>}
    {!loading && address.length === 0 && (
      <p className="text-center  mt-6">
        No addresses found.
      </p>
    )}

    {/* Edit Modal */}
  {isEditOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    {/* Modal Container */}
    <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-3xl overflow-hidden relative animate-fadeIn">
      
      {/* Header Bar */}
      <div className="bg-[#1f567c] text-white px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-wide">Edit Address</h2>
        <button
          onClick={() => setIsEditOpen(false)}
          className="text-white text-2xl hover:opacity-80 transition"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-8 bg-[#fafafa]">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {[
            'doorno', 'house', 'street', 'city', 'pincode',
            'district', 'state', 'country', 'company', 'gst'
          ].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1 capitalize tracking-wide">
                {field === 'gst' ? 'GST Number' : field}
              </label>
              <input
                type="text"
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field] || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f567c]/60 focus:border-[#1f567c] outline-none transition"
              />
            </div>
          ))}

          {/* Buttons Row */}
          <div className="col-span-2 flex justify-end items-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-6 py-2 rounded-lg border border-black text-black hover:bg-black hover:text-white transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#1f567c] text-white rounded-lg hover:bg-[#17425e] transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

  </div>
</div>

  );
}

export default AddresList;