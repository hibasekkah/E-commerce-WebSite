import React from 'react'
import { CgProfile, CgShoppingCart, CgHome, CgSupport, CgLogOut } from 'react-icons/cg'

const SideMenu = [
    { id: 1, icon: CgProfile, name: 'Profile', link:'/Profile'},
    { id: 2, icon: CgShoppingCart, name: 'Orders History', link: '#' },
    { id: 3, icon: CgHome, name: 'Addresses', link: '#' },
    { id: 4, icon: CgSupport, name: 'Support Tickets', link: '#' },
    { id: 5, icon: CgLogOut, name: 'Logout', link: '#' },
]

export default function SidebarAccount() {
  return (
    <div className='m-5'>
      <p className='border-b-2 border-primary p-3 text-lg'>My Account</p>
      <ul>
        {SideMenu.map((element) => {
          const Icon = element.icon;
          return (
            <li key={element.id} >
              <a href={element.link} className='flex items-center p-4 gap-3 cursor-pointer hover:text-primary'>
                <Icon style={{ marginRight: '8px' }}  className='text-xl'/>
                {element.name}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
