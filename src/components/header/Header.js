// // ─── Header.jsx ──────────────────────────────────────────
// import React, { useState, useEffect, useRef } from 'react';
// import { ChevronDownIcon } from '@heroicons/react/20/solid';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// // … your existing asset imports …
// import logo    from '../../assets/logo.svg';
// import cartIco from '../../assets/Cart.svg';
// import profile from '../../assets/profile.svg';
// import search  from '../../assets/search.svg';
// import burger  from '../../assets/burger.svg';

// import DropDown     from '../DropDown';
// import Drawer       from '../Drawer';
// import AuthModal    from '../../Authmodal/AuthModal';
// import CartDrawer   from '../cartdraw/CartDrawer';

// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, token } = useAuth();

//   const [open,       setOpen]       = useState(false);  // products ▼
//   const [sidebar,    setSidebar]    = useState(false);  // mobile ☰
//   const [authOpen,   setAuthOpen]   = useState(false);  // login / signup
//   const [cartOpen,   setCartOpen]   = useState(false);  // cart drawer
  // const [searchOpen, setSearchOpen] = useState(false);  // search modal

//   // Header sticky
//   const [scrolled, setScrolled] = useState(false);
//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 10);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Close mega-menu when clicking outside or on route change
//   const menuRef = useRef(null);
//   useEffect(() => {
//     function onClickOutside(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', onClickOutside);
//     return () => document.removeEventListener('mousedown', onClickOutside);
//   }, []);
//   useEffect(() => setOpen(false), [location]);

//   return (
//     <>
//       {/* ─── Desktop & Tablet Header ───────── */}
//       <div className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 w-[95%] lg:w-[75%]
//                        transition-all duration-300 ease-in-out font-fancy
//                        ${scrolled ? 'bg-[#2A3443]/90 shadow-md backdrop-blur-md' : 'bg-[#2A3443]'}
//                        rounded-[8px] md:rounded-[16px] mt-3`}>
//         <div className="bg-[#2A3443] h-[70px] rounded-[8px] md:rounded-[16px]">
//           <div className="flex items-center h-full justify-between">
//             {/* Logo */}
//             <div className="pl-6">
//               <Link to="/"><img src={logo} alt="Ikonix logo" className="h-8 md:h-10" /></Link>
//             </div>

//             {/* Burger – mobile only */}
//             <button onClick={() => setSidebar(true)} className="md:hidden pr-6">
//               <img src={burger} alt="Open menu" className="w-6 h-6" />
//             </button>

//             {/* Desktop nav */}
//             <div className="hidden md:flex items-center gap-8 pr-6 text-white">
//               <ul className="flex gap-5 items-center text-[16px] font-thin">
//                 <li onClick={() => navigate('/')} className="cursor-pointer">Home</li>
//                 <li onClick={() => navigate('/about')} className="cursor-pointer">About us</li>
//                 <li ref={menuRef} className="relative">
//                   <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1">
//                     Products
//                     <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
//                   </button>
//                   {/* Mega-menu */}
//                   <div className={`absolute z-20 transition-all duration-200
//                                    ${open ? 'opacity-100 translate-y-0 visible'
//                                           : 'opacity-0 -translate-y-3 invisible'}`}>
//                     <div className="absolute left-1/2 -translate-x-1/2 h-5 w-5 rotate-45
//                                     bg-gray-100 border-l border-t border-slate-300 mt-2" />
//                     <DropDown onSelect={() => setOpen(false)} />
//                   </div>
//                 </li>
//                 <li onClick={() => navigate('/contact')} className="cursor-pointer">Contact us</li>
//               </ul>

//               {/* Icons */}
//               <div className="flex gap-3 items-center">
//                 <img src={search} onClick={() => setSearchOpen(true)} alt="Search" className="cursor-pointer" />
//                 <img
//                   src={profile}
//                   alt="Profile"
//                   className="cursor-pointer"
//                   onClick={() => user ? navigate('/user-profile') : setAuthOpen(true)}
//                 />
//                 <img src={cartIco} alt="Cart" className="cursor-pointer" onClick={() => setCartOpen(true)} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ─── Mobile Drawer (☰) ───────────────── */}
//       <Drawer setSideBarOpen={sidebar} onClose={() => setSidebar(false)}>
//         {/* … your mobile menu content … */}
//       </Drawer>

//       {/* ─── Modals ─────────────────────────────── */}
//       <AuthModal  open={authOpen}  onClose={() => setAuthOpen(false)} />
//       <SearchModal
//         open={searchOpen}
//         onClose={() => setSearchOpen(false)}
//         onSubmit={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
//       />
//       <CartDrawer
//         open={cartOpen}
//         onClose={() => setCartOpen(false)}
//         cart={mockCart}              // replace with real cart
//         onInc={id => {/* +1 logic */}}
//         onDec={id => {/* -1 logic */}}
//         onRemove={id => {/* remove logic */}}
//         recommended={discoverMore}   // optional
//       />

//       {/* ─── Fixed Bottom Nav (mobile only) ───────── */}
//       <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-inner z-50">
//         <ul className="flex justify-around items-center py-2">
//           <li onClick={() => setSearchOpen(true)} className="cursor-pointer flex gap-2">
//             <img src={search} alt="Search" className="w-6 h-6 mx-auto" />
//             <span className="text-xs mt-1 block">Search</span>
//           </li>
//           <li onClick={() => setCartOpen(true)} className="cursor-pointer flex gap-2">
//             <img src={cartIco} alt="Cart" className="w-6 h-6 mx-auto" />
//             <span className="text-xs mt-1 block">Cart</span>
//           </li>
//           <li
//             onClick={() => user ? navigate('/user-profile') : setAuthOpen(true)}
//             className="cursor-pointer flex gap-2"
//           >
//             <img src={profile} alt="Profile" className="w-6 h-6 mx-auto" />
//             <span className="text-xs mt-1 block">{user ? 'Profile' : 'Login'}</span>
//           </li>
//         </ul>
//       </nav>
//     </>
//   );
// }

// /* Mock data for quick testing — remove when wired to real store */
// const mockCart = [
//   { id: 1, title: 'Bangalore Bloom Men’s', price: 399, qty: 1,
//     img: 'https://placehold.co/200x240?text=Perfume' },
//   { id: 2, title: 'Bangalore Bloom Men’s', price: 399, qty: 1,
//     img: 'https://placehold.co/200x240?text=Perfume' },
// ];
// const discoverMore = Array.from({ length: 5 }, (_, i) => ({
//   id: i + 10,
//   title: 'Bangalore Bloom Men’s',
//   img: 'https://placehold.co/160x200?text=Perfume',
// }));
// export default Header;




// src/components/layout/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logonews   from "../../assets/logonews.svg";
import burgerMenu from "../../assets/burger-menu.svg";
import closeIcon  from "../../assets/close.svg";
import search     from "../../assets/search.svg";
import cartIco    from "../../assets/Cart.svg";

import OffCanvas   from "./OffCanvas";
import Marquee     from "./Marquee";
import SearchModal from "../search/Search";
import CartDrawer  from "../cartdraw/CartDrawer";
import profile from '../../assets/profile.svg';
import { useAuth } from '../../context/AuthContext';



// demo images for the preview (use your real ones)
import Home  from "../../assets/home.svg";
import Home1 from "../../assets/home2.svg";
import AuthModal    from '../../Authmodal/AuthModal';


const MENU_ITEMS = [
  { title: "Home",       image: Home  },
  { title: "About Us",   image: Home1 },
  { title: "Products",   image: Home  },
  { title: "Services",   image: Home1 },
  { title: "Categories", image: Home  },
  { title: "Blog",       image: Home1 },
  { title: "Contact us", image: Home  },
];

export default function Header() {
  const [isOpen, setIsOpen]         = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const [authOpen,   setAuthOpen]   = useState(false);  // login / signup


  // sticky on scroll
  const [scrolled, setScrolled] = useState(false);
  const [h, setH] = useState(72);
  const wrapRef = useRef(null);


    const { user, token } = useAuth();



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
  const navigate = useNavigate();

  // mock cart (replace with real)
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
          <Link to="/">
            <img src={logonews} alt="The Newspotent logo" className="cursor-pointer h-8" />
          </Link>

          <div className="flex items-center gap-5">

            <div className=" items-center gap-5 hidden lg:flex">
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
                
                <div>
              <button onClick={toggle} aria-label="Menu toggle" className="focus:outline-none">
              <img
                src={isOpen ? closeIcon : burgerMenu}
                alt={isOpen ? "Close menu" : "Open menu"}
                className="w-5 h-5"
              />
            </button>
                </div>
          


          </div>


        </header>
      </div>


  {/* ─── Fixed Bottom Nav (mobile only) ───────── */}
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








    <AuthModal  open={authOpen}  onClose={() => setAuthOpen(false)} />


      {/* Drawers / Modals */}
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
