import React, { useEffect } from 'react'
import HeroBanner from '../../components/home-hero-slider/sliders/HeroBanner'
import CollectionCards from '../../components/collectioncards/CollectionCards'
import SpecialDealsSlider from '../../components/SpecialDealsSlider/SpecialDealsSlider'
import OwnPerfume from '../../components/ownperfume/OwnPerfume'
import UspSection from '../../components/UspSection/UspSection'
import Testimonials from '../../components/Testimonials/Testimonials'
import BlogList from '../../components/Blogs/BlogList'
import ProductList from '../products/ProductList'
import TwoSliders from '../../components/TwoSliders/TwoSliders'
import AboutSection from '../../components/AboutSection/AboutSection'
import InitiativeProducts from '../products/InitiativeProducts'
import OurProducts from '../products/OurProducts'
import ContactSection from '../../components/ContactSection/ContactSection'
import Partners from '../../components/partners/Partners'
import B2bProducts from '../products/B2bProducts'
import Apparels from '../products/Apparels'
import BestSeller from '../products/BestSeller'
import Brand from '../products/Brand'


function Home() {

  return (
    <div className=''>
   
        <div className=''><HeroBanner /></div>
        {/* <div><CollectionCards /></div> */}

        <div><TwoSliders /></div>
        <div><ProductList/></div>
        <div><AboutSection /></div>
        <div><OurProducts /></div>
        <div><InitiativeProducts /></div>
         <div><Testimonials /></div>
         <div><ContactSection/></div>
         <div><Partners/></div>
         <div><B2bProducts/></div>
         <div><Apparels/></div>
         <div><BestSeller /></div>
         <div><Brand /></div>
        {/* <div><SpecialDealsSlider /></div> */}
        {/* <div><OwnPerfume /></div>
        <div><UspSection /></div>
      
       
        <div><BlogList /></div> */}


    </div>
  )
}

export default Home