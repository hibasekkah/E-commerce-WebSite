import React from 'react';
import { MdDashboard, MdLocalOffer, MdInventory2, MdShoppingCart } from 'react-icons/md';

export default function AdminPage() {
  const username = localStorage.getItem('username') || 'Administrator';

  return (
    <div className="px-8 py-10 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome, {username}</h1>
      <p className="text-lg mb-6">
        You are currently logged in with administrative privileges. Below is an overview of the main features available to you:
      </p>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MdDashboard className="text-primary text-2xl mt-1" />
          <div>
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">Access site analytics, recent activities, and key performance metrics.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MdInventory2 className="text-primary text-2xl mt-1" />
          <div>
            <h2 className="text-xl font-semibold">Product Management</h2>
            <p className="text-gray-600 dark:text-gray-300">Add, edit, or remove products to keep your catalog up to date.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MdLocalOffer className="text-primary text-2xl mt-1" />
          <div>
            <h2 className="text-xl font-semibold">Promotions</h2>
            <p className="text-gray-600 dark:text-gray-300">Manage discounts and special offers to attract more customers.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MdShoppingCart className="text-primary text-2xl mt-1" />
          <div>
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="text-gray-600 dark:text-gray-300">Monitor and process customer orders efficiently and promptly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
