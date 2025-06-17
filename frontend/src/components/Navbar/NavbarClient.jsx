import React, { useState, useRef, useEffect  } from 'react';
import Logo from '../../assets/MorocAntik_logo_without_bg.png';
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping, FaCaretDown } from 'react-icons/fa6';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import DarkMode from './DarkMode';
import { CgProfile } from "react-icons/cg";

const categories = [
  { id: 1, name: 'Home Decor', link: '/Category/Home%20Decor' },
  { id: 2, name: 'Clothing & Textiles', link: '/Category/Clothing%20%26%20Textiles' },
  { id: 3, name: 'Natural Cosmetics', link: '/Category/Natural%20Cosmetics' },
  { id: 4, name: 'Accessories & Jewelry', link: '/Category/Accessories%20%26%20Jewelry' },
  { id: 5, name: 'Food & Spices', link: '/Category/Food%20%26%20Spices' }
];


const Menu = [
  { id: 1, name: 'Home', link: '/' },
  { id: 2, name: 'About Us', link: '/About' },
  { id: 3, name: 'Contact Us', link: '/#' },
];

const ProfileElements = [
  {id: 1, name: 'Account', link: '/Account'},
  {id: 2, name: 'Log out', action: 'logout'}
];

const handleProfileAction = (action) => {
  if (action === 'logout') {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("phone");
    localStorage.removeItem("dob");
    localStorage.removeItem("gender");
    // Optional: Redirect to homepage or login
    window.location.href = '/';
  }
};


export default function NavbarClient({username}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const modalLoginRef = useRef();
  const modalRegisterRef = useRef();

  const role = localStorage.getItem('role') || '';
  const currentPath = window.location.pathname;
  const isCategoryActive = categories.some(cat => cat.link === currentPath);

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
            <a href='/' className='font-bold text-2xl sm:text-3xl flex gap-3 items-center'>
              <img src={Logo} alt='Logo' className='w-10 block dark:hidden' />
              MorocAntik
            </a>
          </div>

          {/* Right Side */}
          <div className='flex items-center gap-4'>
            {/* Account */}
            <div className='relative'>
              <div className='group relative cursor-pointer hidden sm:block'>
                <div className='flex items-center gap-1'>
                  <div className='text-2xl'>
                    <CgProfile />
                  </div>
                  <p>{username}</p>
                  <FaCaretDown className='transition-all duration-200 group-hover:rotate-180' />
                </div>
                <div className='absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white text-black shadow-md'>
                  <ul className='shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40'>
                    {ProfileElements.map((data) => (
                      <li key={data.id}>
                        <button
                          onClick={() => data.action === 'logout' ? handleProfileAction('logout') : window.location.href = data.link}
                          className='inline-block w-full text-left rounded-md p-2 hover:bg-primary/20'
                        >
                          {data.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
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
               <button
                  onClick={() =>  window.location.href = data.link}
                  className={`flex items-center p-4 gap-3 cursor-pointer duration-200 ${
                  currentPath === data.link ? 'text-primary font-semibold' : 'hover:text-primary' }`}
                >
                  {data.name}
                </button>
            </li>
          ))}
          {/* Categories Dropdown */}
          <li className='group relative cursor-pointer'>
            <a href="#" className={`flex items-center gap-[2px] py-2
                                   ${isCategoryActive ? 'text-primary font-semibold' : 'hover:text-primary'}`}>
              Categories
              <FaCaretDown className='transition-all duration-200 group-hover:rotate-180' />
            </a>
            <div className='absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white text-black shadow-md'>
              <ul className='shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40'>
                {categories.map((data) => (
                  <li key={data.id}>
                    <button
                      onClick={() => (window.location.href = data.link)}
                      className={`inline-block w-full rounded-md p-2 hover:bg-primary/20 text-left ${
                      currentPath === data.link ? 'text-primary font-semibold' : 'hover:text-primary' }`}
                    >
                      {data.name}
                    </button>
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
          <div className='border-t pt-2'>
            <span className='block font-semibold mb-2'>
              <div className='flex items-center gap-1'>
                  <div className='text-2xl'>
                    <CgProfile />
                  </div>
                  <p>{username}</p>
                </div>
            </span>
            {ProfileElements.map((data) => (
              <button
                key={data.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (data.action === 'logout') {
                    handleProfileAction('logout');
                  } else {
                    window.location.href = data.link;
                  }
                }}
                className='block w-full text-left py-1 text-sm hover:text-primary'
              >
                {data.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
