import React from 'react';
import { Link } from 'react-router-dom';

function Banner() {
  return (
    <div>
       {/* Breadcrumb */}
  <nav className="text-sm text-gray-500 flex items-center space-x-1">
    <Link to="/" className="hover:text-[#1f567c] font-medium">
      Home
    </Link>
    <span>/</span>
    <span className="text-gray-700 font-medium">Quizes</span>
  </nav>
        <div className='w-full bg-[#1f567c] h-44 mt-2 rounded-[12px] flex items-center justify-center'>
        <div>
            <h1 className='text-white text-2xl tracking-wide'>Quizes</h1>
        </div>
    </div>
    </div>
  
  )
}

export default Banner