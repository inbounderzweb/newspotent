import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import footerlogo from '../../assets/footerlogonews.svg';
import callimg from '../../assets/call.svg';
import envelop from '../../assets/envelop.svg'

function Footer() {
  return (
    <footer className="bg-[#1F567C] text-white py-12">
      <div className="w-[95%] lg:w-[75%] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 items-end gap-8">
        {/* Logo */}
        <div>
          <img src={footerlogo} alt="Ikonix Logo" className="h-8 mb-4" />
          <p className="text-white">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
        </div>

        {/* Contact Info */}
        <div>
            <ul className="space-y-2">
          <li>Home</li>
            <li>About Us</li>
            <li>Products</li>
            <li>Blogs</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Links */}
        <div>
         <ul className="space-y-3">    
            <li className="flex items-center gap-2">
              <FaFacebookF />
              <span>Facebook</span>
            </li>
            <li className="flex items-center gap-2">
              <FaInstagram />
              <span>Instagram</span>
            </li>
            <li className="flex items-center gap-2">
              <FaXTwitter />
              <span>X.com</span>
            </li>
              <li className="flex items-center gap-2">
              <FaLinkedin />
              <span>Linkdin</span>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="">
          
          <div className="flex gap-5 bg-white w-48 pl-[6px] py-2 px-3 rounded-[2rem] justify-center items-center mb-4">
            <img src={callimg} alt="phone-icon" className="w-6" />
            <div className="  text-[#0E283A]">+91 0000 000 000</div>
          </div>

             <div className="flex gap-5 rounded-[2rem] items-center">
            <img src={envelop} alt="phone-icon" className="w-8" />
            <div className="  text-white">info@thenewspotent.com</div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E0D6CF] mt-8 pt-4 items-center text-sm w-[75%] mx-auto">
     
        <div className="gap-4 mt-2 md:mt-0">
        <p className="text-center text-white">© Copyright 2015 - 2025 | | All Rights Reserved | Thenewspotent</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
