import React, {useState} from 'react'
import { MenuIcon } from 'lucide-react';
import SidebarProduct from '../Sidebar/SidebarProduct';
import VariantProd from './VariantProd'
import { IoClose } from 'react-icons/io5';

export default function VariantProdPage() {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div className="relative">
        {/* 👇 Button only shown on small screens */}
        <button
            className="w-full md:hidden flex items-center justify-center gap-2 px-4 py-2 shadow-sm bg-gradient-to-tr from-secondary to-primary/60 text-lg font-medium hover:bg-primary/90 transition duration-200"
            onClick={() => setShowSidebar(true)}
        >
            <MenuIcon size={20} /> {/* e.g., from lucide-react */}
            <span>Product Menu</span>
        </button>


        {/* 👇 Sidebar overlay on mobile */}
        {showSidebar && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:hidden">
            <button
                className="mb-4 text-red-500"
                onClick={() => setShowSidebar(false)}
            >
                <IoClose  className='absolute right-4 text-lg text-gray-600 hover:text-primary transition duration-200'/>
            </button>
            <SidebarProduct indexLink={1} />
            </div>
        )}

        {/* 👇 Desktop layout */}
        <div className="flex gap-3">
            <div className="hidden md:block md:w-1/5">
            <SidebarProduct indexLink={1}/>
            </div>
            <div className="w-full md:w-4/5">
            <VariantProd />
            </div>
        </div>
        </div>
    );
}
