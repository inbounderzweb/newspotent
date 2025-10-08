import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useCart } from "../context/CartContext";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clear } = useCart();
  const addressId = state?.address_id;

  useEffect(() => {
    if (addressId) clear();
  }, []);

  // CONFETTI EFFECT (Canvas)
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);

    const colors = ["#1f567c", "#60A5FA", "#93C5FD", "#BFDBFE", "#E0F2FE", "#F8FAFC"];
    const pieces = Array.from({ length: 100 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: Math.random() * 5 + 2,
      d: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
    }));

    let animationId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pieces.forEach((p) => {
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });
      update();
      animationId = requestAnimationFrame(draw);
    };

    const update = () => {
      pieces.forEach((p, i) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) * 0.7;
        p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;
        if (p.y > H) {
          p.y = -20;
          p.x = Math.random() * W;
        }
      });
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1f567c] via-[#e8f3ff] to-white">
      {/* Confetti */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* Floating glow particles */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute bg-white/50 rounded-full blur-sm animate-floatSlow"
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-30 w-[90%] sm:w-[420px] bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 text-center py-10 px-6 sm:px-10">
        {/* Animated Check Icon */}
        <div className="flex justify-center mb-4 animate-scaleIn">
          <div className="rounded-full bg-[#1f567c]/10 p-4">
            <CheckCircleIcon className="h-14 w-14 text-[#1f567c] drop-shadow-md" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 animate-fadeUp">
          Thank You!
        </h1>
        <p className="text-black/60 text-base mb-6 animate-fadeUp delay-[0.2s]">
          Your order has been placed successfully.  
          You’ll receive a confirmation email shortly.
        </p>

        {/* Order Details */}
        <div className="bg-white/70 border border-[#1f567c]/20 rounded-2xl p-4 text-sm text-black/70 mb-6 animate-fadeUp delay-[0.3s]">
          <p>
            <span className="font-semibold text-[#1f567c]">Order ID:</span>{" "}
            {state?.orderId || "Pending Confirmation"}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-[#1f567c]">Status:</span>{" "}
            Confirmed
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fadeUp delay-[0.4s]">
          <button
            onClick={() => navigate("/shop")}
            className="px-5 py-2.5 rounded-md border border-[#1f567c] text-[#1f567c] hover:bg-[#1f567c] hover:text-white transition-all duration-300"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-md bg-[#1f567c] text-white hover:opacity-90 transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 0.6; }
        }
        .animate-floatSlow {
          animation: floatSlow 6s ease-in-out infinite;
        }

        @keyframes scaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }

        @keyframes fadeUp {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeUp {
          animation: fadeUp 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
