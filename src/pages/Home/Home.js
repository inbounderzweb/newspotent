import React, { useEffect } from 'react'
import HeroBanner from '../../components/home-hero-slider/sliders/HeroBanner'
import CollectionCards from '../../components/collectioncards/CollectionCards'
import SpecialDealsSlider from '../../components/SpecialDealsSlider/SpecialDealsSlider'
import OwnPerfume from '../../components/ownperfume/OwnPerfume'
import UspSection from '../../components/UspSection/UspSection'
import InstagramShowcase from '../../components/InstagramShowcase/InstagramShowcase'
import Testimonials from '../../components/Testimonials/Testimonials'
import BlogList from '../../components/Blogs/BlogList'
import ProductList from '../products/ProductList'
import TwoSliders from '../../components/TwoSliders/TwoSliders'
import AboutSection from '../../components/AboutSection/AboutSection'
import InitiativeProducts from '../products/InitiativeProducts'


function Home() {

  return (
    <div className=''>
   
        <div className=''><HeroBanner /></div>
        {/* <div><CollectionCards /></div> */}

        <div><TwoSliders /></div>
        <div><ProductList/></div>
        <div><AboutSection /></div>
        <div><InitiativeProducts /></div>
        {/* <div><SpecialDealsSlider /></div> */}
        {/* <div><OwnPerfume /></div>
        <div><UspSection /></div>
        <div><InstagramShowcase /></div>
        <div><Testimonials /></div>
        <div><BlogList /></div> */}


    </div>
  )
}

export default Home