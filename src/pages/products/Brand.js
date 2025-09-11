// src/components/ProductList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import brandicon from '../../assets/brand-frame.png'



export default function Brand() {
  const navigate = useNavigate();


  return (
    <>


<div className='font-[manrope] text-[#256795] text-[25px] leading-[120%] tracking-[0.5px] mx-auto w-full text-center my-5'>Shop by brand</div>
<div className='mx-auto w-[80%] lg:w-[50%] text-center text-[#000] text-[manrope] font-[400] pb-5 text-[16px] leading-[170%] tracking-[0.5px]'>
  <span>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod 
tincidunt ut laoreet dolore magna aliquam erat volutpat.</span>
</div>
{/* <div className="h-[220px] bg-[#34552B] rounded-[24px] mx-auto w-[90%] md:w-[75%] py-8"></div> */}


      <section className="mx-auto w-[90%] md:w-[75%] py-8">
        {/* 🔥 Removed filter pills completely */}

 






<div className="grid grid-cols-4 gap-5 items-center justify-center">

  <div className="flex flex-col items-center">
    <img src={brandicon} alt="brand-icon" />
    <button
      className="mt-2 px-4 py-2 bg-[#2972A5] text-white rounded-full w-[60%] mx-auto text-center"
      onClick={() => navigate('/#')}
    >
      View Brands
    </button>
  </div>

  <div className="flex flex-col items-center">
    <img src={brandicon} alt="brand-icon" />
    <button
      className="mt-2 px-4 py-2 bg-[#2972A5] text-white rounded-full w-[60%] mx-auto text-center"
      onClick={() => navigate('/#')}
    >
      View Brands
    </button>
  </div>

  <div className="flex flex-col items-center">
    <img src={brandicon} alt="brand-icon" />
    <button
      className="mt-2 px-4 py-2 bg-[#2972A5] text-white rounded-full w-[60%] mx-auto text-center"
      onClick={() => navigate('/#')}
    >
      View Brands
    </button>
  </div>

    <div className="flex flex-col items-center">
    <img src={brandicon} alt="brand-icon" />
    <button
      className="mt-2 px-4 py-2 bg-[#2972A5] text-white rounded-full w-[60%] mx-auto text-center"
      onClick={() => navigate('/#')}
    >
      View Brands
    </button>
  </div>

</div>



        {/* View All */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2 text-[#0E283A] rounded-full border-[1px] border-[#0E283A]"
          >
            View all Products
          </button>
        </div>

      </section>
    </>
  );
}
