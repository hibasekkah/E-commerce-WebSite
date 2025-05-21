import React, { useState, useRef, useEffect  } from 'react';
import Logo from '../../assets/MorocAntik_logo_without_bg.png';
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping, FaCaretDown } from 'react-icons/fa6';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import DarkMode from './DarkMode';
import { CgProfile } from "react-icons/cg";
import Login from '../Login'
import Register from '../Register';

const categories = [
  { id: 1, name: 'Leather Craft', link: '/#' },
  { id: 2, name: 'Textiles & Carpets', link: '/#' },
  { id: 3, name: 'Ceramics & Pottery', link: '/#' },
  { id: 4, name: 'Jewelry & Accessories', link: '/#' },
  { id: 5, name: 'Woodwork', link: '/#' },
  { id: 6, name: 'Metal Products', link: '/#' },
  { id: 7, name: 'Natural Cosmetics', link: '/#' },
  { id: 8, name: 'Spices & Food Products', link: '/#' },
];

const Menu = [
  { id: 1, name: 'Home', link: '/' },
  { id: 2, name: 'About Us', link: '/About' },
  { id: 3, name: 'Contact Us', link: '/#' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const modalLoginRef = useRef();
  const modalRegisterRef = useRef();

  const handleClickOutside = (event) => {
    if (modalLoginRef.current && !modalLoginRef.current.contains(event.target)) {
      setShowLogin(false);
    }
    if (modalRegisterRef.current && !modalRegisterRef.current.contains(event.target)) {
      setShowRegister(false);
    }
  };

  useEffect(() => {
    if (showLogin || showRegister) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogin, showRegister]);

  return (
    <div className='shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40'>
      
      {/* Upper Navbar */}
      <div className='bg-primary/40 py-3 sm:py-0'>
        <div className='container flex justify-between items-center'>
          {/* Logo */}
          <div>
            <a href='#' className='font-bold text-2xl sm:text-3xl flex gap-3 items-center'>
              <img src={Logo} alt='Logo' className='w-10 block dark:hidden' />
              MorocAntik
            </a>
          </div>

          {/* Right Side */}
          <div className='flex items-center gap-4'>
            {/* Search bar (hidden on small screens) */}
            <div className='relative group hidden sm:block'>
              <input
                type="text"
                placeholder='search'
                className='w-[200px] group-hover:w-[300px] transition-all duration-300 rounded-full border border-gray-300 px-2 py-1 focus:outline-none focus:border-primary dark:bg-gray-800 dark:text-white dark:border-gray-600'
              />
              <IoMdSearch className='text-gray-500 group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-3' />
            </div>
            {/* Login / Register */}
            <div className='relative'>
              <div className='gap-1 cursor-pointer hidden sm:flex' onClick={() => setShowLogin(true)}>
                <div className='text-2xl'>
                  <CgProfile />
                </div>
                <p>Login / Register</p>
              </div>
              {showLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div ref={modalLoginRef}>
                    <Login
                      onClose={() => setShowLogin(false)}
                      onSwitchToRegister={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                      }}
                    />
                  </div>
                </div>
              )}

              {showRegister && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div ref={modalRegisterRef}>
                    <Register 
                      onClose={() => setShowRegister(false)} 
                      onSwitchToLogin={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                      }}
                    />
                  </div>
                </div>
              )}

            </div>
            
            {/* Order button */}
            <button
              onClick={() => alert('Ordering not available yet')}
              className='bg-gradient-to-r from-primary to-secondary transition-all duration-200 text-white py-1 px-4 rounded-full flex items-center gap-3 group'
            >
              <span className='group-hover:block hidden transition-all duration-200'>Order</span>
              <FaCartShopping className='text-xl text-white drop-shadow-sm cursor-pointer' />
            </button>

            {/* Dark mode switch */}
            <div className="ml-4">
              <DarkMode />
            </div>

            {/* Hamburger menu icon (mobile only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='sm:hidden text-2xl'
            >
              {mobileMenuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className='justify-center hidden sm:flex'>
        <ul className='flex items-center gap-4'>
          {Menu.map((data) => (
            <li key={data.id}>
              <a href={data.link} className='inline-block px-4 hover:text-primary duration-200'>
                {data.name}
              </a>
            </li>
          ))}
          {/* Categories Dropdown */}
          <li className='group relative cursor-pointer'>
            <a href="#" className='flex items-center gap-[2px] py-2'>
              Categories
              <FaCaretDown className='transition-all duration-200 group-hover:rotate-180' />
            </a>
            <div className='absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white text-black shadow-md'>
              <ul>
                {categories.map((data) => (
                  <li key={data.id}>
                    <a href={data.link} className='inline-block w-full rounded-md p-2 hover:bg-primary/20'>
                      {data.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='sm:hidden bg-white dark:bg-gray-900 px-4 py-4 shadow-md space-y-2'>
          {Menu.map((data) => (
            <a
              key={data.id}
              href={data.link}
              className='block py-2 text-base hover:text-primary'
              onClick={() => setMobileMenuOpen(false)}
            >
              {data.name}
            </a>
          ))}
          <div className='border-t pt-2'>
            <span className='block font-semibold mb-2'>Categories</span>
            {categories.map((data) => (
              <a
                key={data.id}
                href={data.link}
                className='block py-1 text-sm hover:text-primary'
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.name}
              </a>
            ))}
          </div>
          <hr className='border-t'/>
          {/* Login / Register */}
            <div className='relative'>
              <div className='flex  items-center gap-1 cursor-pointer py-1 text-base hover:text-primary' onClick={() => setShowLogin(true)}>
                <div className=''>
                  <CgProfile />
                </div>
                <p>Login / Register</p>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
