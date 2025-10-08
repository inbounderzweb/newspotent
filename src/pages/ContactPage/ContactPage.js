import React, { useState } from "react";
import { FiPhone } from "react-icons/fi";
import illustration from '../../assets/contact.svg'
import SpecialDealsSlider from "../../components/SpecialDealsSlider/SpecialDealsSlider";
import OwnPerfume from "../../components/ownperfume/OwnPerfume";
import { Link } from "react-router-dom";


/**
 * ContactPage – matches your desktop & mobile mock 1‑to‑1.
 * Plug into <Route path="/contact" element={<ContactPage />} />
 */
export default function ContactPage() {
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    comment: "",
  });
  const inputBase =
    "w-full border text-[14px] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#b49d91]";

  return (
   <section className="relative w-[95%] md:w-[80%] mx-auto font-['Inter',sans-serif] py-16">

  {/* --- Breadcrumb --- */}
  <nav className="text-sm text-gray-600 mb-6">
    <Link to="/" className="hover:text-[#1f567c] font-medium">Home</Link>
    <span className="mx-1">/</span>
    <span className="text-black font-medium">Contact Us</span>
  </nav>

  {/* --- Heading --- */}
  <h1 className="text-center text-4xl font-semibold text-[#1f567c] mb-12">
    Get in Touch
  </h1>

  {/* --- Content Grid --- */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start bg-gradient-to-br from-[#f5f8fa] to-[#eaf0f4] rounded-[24px] shadow-lg p-2 md:p-14">
    
    {/* --- Left: Contact Form --- */}
    <form
      className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className="text-2xl font-semibold text-[#1f567c] mb-6 text-center">
        Send us a Message
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          { id: "first", label: "First Name", type: "text", value: form.first },
          { id: "last", label: "Last Name", type: "text", value: form.last },
          { id: "email", label: "Email", type: "email", value: form.email },
        ].map((field) => (
          <div key={field.id} className="flex flex-col">
            <label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              placeholder={field.label}
              value={field.value}
              onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1f567c]/50 outline-none"
            />
          </div>
        ))}

        {/* Phone Field */}
        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <span className="bg-gray-100 px-3 text-gray-700">+91</span>
            <input
              id="phone"
              type="tel"
              placeholder="0000 000 000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="flex-1 px-3 py-2 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="mt-5">
        <label htmlFor="comment" className="text-sm font-medium text-gray-700 mb-1 block">
          Message
        </label>
        <textarea
          id="comment"
          rows={4}
          placeholder="Write your message..."
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-[#1f567c]/50 outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-6 w-full bg-[#1f567c] text-white py-3 rounded-lg hover:bg-[#143751] transition-all duration-200"
      >
        Submit
      </button>
    </form>

    {/* --- Right: Contact Info / Illustration --- */}
    <div className="flex flex-col justify-center text-[#1f567c]">
   
      <div className="space-y-5 text-center md:text-left">
        <div>
          <h3 className="text-lg font-semibold text-black">Call Us</h3>
          <p className="text-sm">+91 90000 00000</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">Email</h3>
          <p className="text-sm">support@yourbrand.com</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">Address</h3>
          <p className="text-sm leading-relaxed">
            123, Business Avenue,<br /> Kochi, Kerala - 682001
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Floating WhatsApp */}
  <a
    href="https://wa.me/919000000000"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed right-5 bottom-5 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
  >
    <FiPhone className="w-6 h-6 text-white" />
  </a>
</section>

  );
}
