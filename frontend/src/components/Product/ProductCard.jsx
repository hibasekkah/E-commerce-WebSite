import React from 'react'


export default function ProductCard ({image, name, id, price,prevPrice, discount}) {


  return (
        <div    onClick={() => window.location.href = `/Product/${id}`}
                className='text-white w-[300px] h-[450px] grid grid-rows-[320px_60px_20px] grid-cols-1 bg-gradient-to-br
                from-primary/40 to-secondary/70 rounded-xl p-5 m-6 cursor-pointer 
                transition-transform transform hover:scale-105'
        >
            <div className="overflow-hidden flex items-center justify-center">
                <img
                src={image}
                alt="image of the product"
                className="h-full object-contain"
                />
            </div>
            <p className='font-semibold overflow-hidden text-ellipsis text-lg'>
                {name}
            </p>
            <div className="flex items-end">
                <p className='text-2xl font-semibold mr-3'>{price}$</p>
                <p className='line-through text-gray-600 mr-3'>{prevPrice ? prevPrice + '$' : null}</p>
                <p className=" text-red-600 font-bold text-lg bg-red-100 px-2 rounded">{discount ? `-${parseInt(discount)}%` : null}</p>
            </div>
        </div>

  )
}
