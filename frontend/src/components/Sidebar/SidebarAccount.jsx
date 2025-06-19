import React from 'react'
import { CgProfile, CgShoppingCart, CgHome, CgSupport, CgLogOut } from 'react-icons/cg';
import { RiLockPasswordLine } from "react-icons/ri";


const SideMenu = [
    { id: 1, icon: CgProfile, name: 'Profile', link:'/Profile'},
    { id: 2, icon: RiLockPasswordLine, name: 'Change Password', link: '/ChangePasswordPage' },
    { id: 3, icon: CgShoppingCart, name: 'Orders History', link: '/OrderHistory' },
    { id: 4, icon: CgLogOut, name: 'Logout', action: 'logout' },
]


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

export default function SidebarAccount() {
  const currentPath = window.location.pathname;

  return (
    <div className='m-5'>
      <p className='border-b-2 border-primary p-3 text-lg'>My Account</p>
      <ul>
        {SideMenu.map((element) => {
          const Icon = element.icon;
          return (
            <li key={element.id} >
              <button
                onClick={() => element.action === 'logout' ? handleProfileAction('logout') : window.location.href = element.link}
                className={`flex items-center p-4 gap-3 cursor-pointer duration-200 ${
                currentPath === element.link ? 'text-primary font-semibold' : 'hover:text-primary' }`}
              >
                <Icon style={{ marginRight: '8px' }}  className='text-xl'/>
                {element.name}
              </button>
              
            </li>
          )
        })}
      </ul>
    </div>
  )
}
