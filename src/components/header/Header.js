import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logonews   from "../../assets/logonews.svg";
import burgerMenu from "../../assets/burger-menu.svg";
import closeIcon  from "../../assets/close.svg";
import search     from "../../assets/search.svg";
import cartIco    from "../../assets/Cart.svg";
import profile    from "../../assets/profile.svg";

import OffCanvas   from "./OffCanvas";
import Marquee     from "./Marquee";
import SearchModal from "../search/Search";
import CartDrawer  from "../cartdraw/CartDrawer";
import AuthModal   from "../../Authmodal/AuthModal";
import { useAuth } from "../../context/AuthContext";

// demo images for the preview (replace with your real ones)
import Home  from "../../assets/home.svg";
import Home1 from "../../assets/home2.svg";

const MENU_ITEMS = [
  { title: "Home",       to: "/",           image: Home  },
  { title: "About Us",   to: "/about",      image: Home1 },
  { title: "Products",   to: "/shop",   image: Home  },
  // { title: "Services",   to: "/services",   image: Home1 },
  // { title: "Categories", to: "/categories", image: Home  },
  // { title: "Blog",       to: "/blog",       image: Home1 },
  { title: "Contact us", to: "/contact",    image: Home  },
];

export default function Header() {
  const [isOpen, setIsOpen]         = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const [authOpen, setAuthOpen]     = useState(false);

  const [scrolled, setScrolled] = useState(false);
  const [h, setH] = useState(72);
  const wrapRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Measure header height & sticky behavior
  useEffect(() => {
    if (wrapRef.current) setH(wrapRef.current.offsetHeight);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = () => setIsOpen(o => !o);

  // Mock cart (replace with real cart from your store)
  const mockCart = [
    { id: 1, title: "Bangalore Bloom Men’s", price: 399, qty: 1, img: "https://placehold.co/200x240?text=Perfume" },
    { id: 2, title: "Bangalore Bloom Men’s", price: 399, qty: 1, img: "https://placehold.co/200x240?text=Perfume" },
  ];
  const discoverMore = Array.from({ length: 5 }, (_, i) => ({
    id: i + 10, title: "Bangalore Bloom Men’s", img: "https://placehold.co/160x200?text=Perfume",
  }));

  return (
    <>
      {/* spacer prevents content jump when header becomes fixed */}
      <div style={{ height: scrolled ? h : 0 }} />

      <div
        ref={wrapRef}
        className={scrolled ? "fixed top-0 left-0 w-full z-50" : "relative w-full z-50"}
      >
        <header
          className={[
            "mx-auto flex items-center justify-between px-4 lg:px-20",
            "transition-all duration-300 ease-out bg-white",
            scrolled ? "h-[68px] shadow-md backdrop-blur supports-[backdrop-filter]:bg-white/90" : "h-[72px]",
          ].join(" ")}
        >
          <Link to="/" aria-label="Newspotent home">
            <img src={logonews} alt="The Newspotent logo" className="cursor-pointer h-8" />
          </Link>

          <div className="flex items-center gap-5">
            {/* Desktop icons */}
            <div className="items-center gap-5 hidden lg:flex">

            <li className="cursor-pointer flex gap-2">
            <a href="https://forms.gle/Fx4KRjcdXFjPcGeR8"><span className="text-xs mt-1 block text-black">Quiz</span></a>
          </li>
            <li className="cursor-pointer flex gap-2">
            <span className="text-xs mt-1 block text-black">Quiz-2</span>
          </li>



              <img
                src={profile}
                alt="Profile"
                className="cursor-pointer"
                onClick={() => user ? navigate('/user-profile') : setAuthOpen(true)}
              />

              <img
                src={cartIco}
                alt="Cart"
                className="cursor-pointer w-[27px]"
                onClick={() => setCartOpen(true)}
              />
              <img
                src={search}
                alt="Search"
                className="cursor-pointer"
                onClick={() => setSearchOpen(true)}
              />
            </div>

            {/* Burger / Close */}
            <button onClick={toggle} aria-label="Menu toggle" className="focus:outline-none">
              <img
                src={isOpen ? closeIcon : burgerMenu}
                alt={isOpen ? "Close menu" : "Open menu"}
                className="w-5 h-5"
              />
            </button>
          </div>
        </header>
      </div>

      {/* Fixed Bottom Nav (mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-inner z-50">
        <ul className="flex justify-around items-center py-2">
          <li onClick={() => setSearchOpen(true)} className="cursor-pointer flex gap-2">
            <img src={search} alt="Search" className="w-6 h-6 mx-auto" />
            <span className="text-xs mt-1 block">Search</span>
          </li>
          <li onClick={() => setCartOpen(true)} className="cursor-pointer flex gap-2">
            <img src={cartIco} alt="Cart" className="w-6 h-6 mx-auto" />
            <span className="text-xs mt-1 block">Cart</span>
          </li>
          <li
            onClick={() => user ? navigate('/user-profile') : setAuthOpen(true)}
            className="cursor-pointer flex gap-2"
          >
            <img src={profile} alt="Profile" className="w-6 h-6 mx-auto" />
            <span className="text-xs mt-1 block">{user ? 'Profile' : 'Login'}</span>
          </li>
        </ul>
      </nav>

      {/* Modals / Drawers */}
      <AuthModal  open={authOpen}  onClose={() => setAuthOpen(false)} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={mockCart}
        onInc={() => {}}
        onDec={() => {}}
        onRemove={() => {}}
        recommended={discoverMore}
      />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
      />

      <OffCanvas
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        menuItems={MENU_ITEMS}
      />

      <Marquee />
    </>
  );
}
