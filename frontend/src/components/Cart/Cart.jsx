import React from 'react'

export default function Cart({image, name, variantions, quantity , price}) {
  return (
        <div className='w-1/2 border-primary border-2 rounded-lg p-10'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-10'>
                <img src={image}
                    className='border-primary border-2'    
                /> 
                <div>
                    <p className='mt-3 text-2xl font-semibold text-primary'>{name}</p>
                </div>
            </div>
        </div>
    
  )
}
