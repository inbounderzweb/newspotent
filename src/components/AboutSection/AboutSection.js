import React from 'react'
import aboutimg from '../../assets/about.svg'

function AboutSection() {
  return (
    <div className='bg-[#BDD3E3] w-full py-20'>

<div className='grid lg:flex w-[95%] lg:w-[70%] mx-auto item-top gap-9'>
<div>
    <img src={aboutimg} alt='about-image' className='w-full' />
</div>
<div className='w-[95%] lg:w-[50%]'>
    <h3 className='text-[#256795] font-[manrope] text-[25px] font-[600]'>About Us</h3>
    <p className='text-[#0E283A] text-[16px] font-[manrope] font-[200] tracking-wide leading-8'>
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum.
    </p>
</div>
</div>
    </div>
  )
}

export default AboutSection