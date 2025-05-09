import React from 'react'
import Logo from '../../assets/MorocAntik_logo_without_bg.png'
import { useState, useEffect } from 'react';
import {
    FaFacebook, 
    FaInstagram, 
    FaLinkedin, 
    FaMobileAlt, 
    FaArrowUp
} from "react-icons/fa"
import { MdOutlineMailOutline } from "react-icons/md";

const FooterLinks = [
  {
    title: 'Home',
    link: '/#'
  }, {
    title: 'About',
    link: '/#'
  }, {
    title: 'Contact',
    link: '/#'
  }
]

export default function Footer() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300); // Show button after 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className='text-white bg-gradient-to-br from-gray-800 to-gray-600'>
      <div className='container'>
        <div data-aos="zoom-in" className='flex flex-wrap justify-between items-start pb-20
         pt-5'>
          {/* company details */}
          <div className='py-8 px-4 w-[400px]'>
            <h1 
            className='sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3 flex items-center gap-3'
            >
              <img src={Logo} alt=""  
              className='max-w-[70px]'/>
              MorocAntik</h1>
            <p>A curated Moroccan marketplace celebrating the rich heritage of local artisans — discover handcrafted treasures in leather, ceramics, textiles, and more, each piece telling a story of tradition and authenticity.</p>
          </div>
          {/* Footer Links */}
            <div>
              <div className='py-8 px-4'>
                <h1
                className='sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3'>
                  Links
                </h1>
                <ul className='flex flex-col gap-3'>
                  {
                    FooterLinks.map((link) => (
                      <li className='cursor-pointer hover:text-primary/70 hover:translate-x-1 duration-300 text-gray-200'  key={link.title}>
                        <span>{link.title}</span>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
            
            {/* social links */}

            <div>
              <div className="flex items-center gap-3 mt-6">
                <a href="#">
                  <FaInstagram className='text-3xl'/>
                </a>
                <a href="#">
                  <FaFacebook className='text-3xl'/>
                </a>
                <a href="#">
                  <FaLinkedin className='text-3xl'/>
                </a>
              </div>
              <div className='mt-6'>
                <div className='flex items-center gap-3 mt-3'>
                  <MdOutlineMailOutline className='text-2xl'/>
                  <p>MorocAntik@gmail.components</p>
                </div>
                <div className='flex items-center gap-3 mt-3'>
                  <FaMobileAlt className='text-2xl '/>
                  <p>+212 615247893</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition duration-300"
        >
          <FaArrowUp />
        </button>
)}

      </div>
  )
}
