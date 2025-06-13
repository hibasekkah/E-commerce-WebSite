import React from 'react'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

const SideMenu = [
    { id: 1, icon: PlusCircle, name: 'Add Product', link:'/Product/Add'},
    { id: 2, icon: Pencil, name: 'Edit Product', link:'#'},
    { id: 3, icon: Trash2, name: 'Delete Product', link:'/Product/Delete'},
];

export default function SidebarProduct({indexLink}) {

  return (
    <div className='m-5'>
      <p className='border-b-2 border-primary p-3 text-lg'>Manage Products</p>
      <ul>
        {SideMenu.map((element) => {
          const Icon = element.icon;
          return (
            <li key={element.id} >
              <button
                onClick={() => window.location.href = element.link}
                className={`flex items-center p-4 gap-3 cursor-pointer duration-200 ${
                element.id === indexLink ? 'text-primary font-semibold' : 'hover:text-primary' }`}
              >
                <Icon size={17}  className='text-xl'/>
                {element.name}
              </button>
              
            </li>
          )
        })}
      </ul>
    </div>
  )
}
