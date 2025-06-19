import React from 'react';
import dayjs from 'dayjs';

export default function OrderCardAdmin({ lines, createdAt, status, orderTotal, user, shippingMethod, shippingAddress }) {
  const formattedDate = dayjs(createdAt).format('MMMM D, YYYY [at] HH:mm');
  const formattedPhone = user?.phone ? `+${user.phone}` : '';

  return (
    <div className='w-full max-w-4xl border-primary border-2 rounded-lg p-10 mb-5'>
      {/* Header with date and status */}
      <div className='flex justify-between items-start gap-4 mb-5'>
        <p className=' text-gray-500'>Ordered on: <span className='font-medium'>{formattedDate}</span></p>
        <p className=' text-primary font-semibold'>{status}</p>
      </div>

      {/* User Info */}
      <div className='mb-5 flex flex-col gap-2 bg-gray-50 border border-gray-300 rounded p-4'>
        <p><span className='font-semibold'>Username:</span> {user?.username}</p>
        <p><span className='font-semibold'>Email:</span> {user?.email}</p>
        <p><span className='font-semibold'>Phone:</span> {formattedPhone}</p>
        <p><span className='font-semibold'>Shipping Method:</span> {shippingMethod}</p>
      </div>

      {/* Shipping Address */}
      {shippingMethod !== 'In-Store Pickup' && (
        <div className='mb-5 bg-gray-50 border border-gray-300 rounded p-4'>
          <p className='font-semibold mb-2'>Shipping Address:</p>
          <p>{shippingAddress.address}</p>
          <p>{shippingAddress.city}, {shippingAddress.state}</p>
          <p>{shippingAddress.postal_code}, {shippingAddress.country}</p>
        </div>
      )}
      {/* Product lines */}
      <div className='flex flex-col border-gray-600 border-2'>
        <div className='grid grid-cols-3 gap-5 font-semibold text-primary border-b-4 border-gray-500 
                        px-3 py-2'>
          <span>Product name</span>
          <span>Unit Price</span>
          <span>Quantity</span>
        </div>
        {lines.map((line, index) => (
          <div key={index} className='grid grid-cols-3 gap-5 border-b-2 border-gray-600 
                                        px-3 py-2'>
            <span>{line.product_item.name}</span>
            <span>{line.price}$</span>
            <span>{line.quantity}</span>
          </div>
        ))}
      </div>
        <div className="flex justify-end mt-3">
        <p className="inline-block text-red-600 font-bold text-lg bg-red-100 px-5 py-3 rounded">
            Order Total : {orderTotal}$
        </p>
        </div>
    </div>
  );
}
