import React, { useState } from 'react'

const renderDimensions = (element) => {
  if (!element.variantDimensions || typeof element.variantDimensions !== 'object') return null;

  return Object.entries(element.variantDimensions).map(([key, value]) => (
    <div className="mb-4" key={key}>
        <label className="block font-semibold mb-3 capitalize">{key}:</label>
        <p>{value}</p>
    </div>
  ));
};


export default function Item({element, index, removeItem}) {

    return (
    <div className='py-4 px-10 border-2 border-secondary rounded-lg  w-full flex flex-col justify-between' key={index}>
        <h2 className="text-2xl font-medium mb-7 text-center text-secondary">Item {index + 1}</h2>
        <div className="grid grid-cols-2 gap-6 mb-3">
            <div className="mb-4">
                <label className="block font-semibold mb-3">Price:</label>
                <p>{element.price}</p>
            </div>
            <div className="mb-4">
                <label className="block font-semibold mb-3">Quantity:</label>
                <p>{element.quantity}</p>
            </div>
            {renderDimensions(element)}

            {
                element.image ? 
                <div className="mb-4">
                    <label className="block font-semibold mb-3">Picture:</label>
                     <p>{element.image.name}</p> 
                </div> : ''
            }
            {
                element.color ? 
                <div className="mb-4">
                    <label className="block font-semibold mb-3">Color:</label>
                    <p>{element.color}</p> 
                </div> : ''
            }          
        </div>
        <div className="mt-auto flex justify-end">
            <button
            onClick={() => removeItem(index)}
            className="px-4 py-2 rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
            >
            Remove
            </button>
      </div>
    </div>
  )
}
