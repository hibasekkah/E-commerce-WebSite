import React from 'react'

export default function Hero() {
  return (
    <main>
      <div className='w-full h-screen flex flex-col justify-center items-center gap-10'>
        <h1 className='md:w-[800px] text-center font-dancing text-3xl sm:text-5xl md:text-7xl text-white mix-blend-lighten'>Timeless Moroccan Treasures at Your Doorstep</h1>
        <p className='text-white mix-blend-lighten text-xl  sm:text-xl md:text-2xl text-center'>Discover the soul of Morocco through its finest products. Support local artisans and bring home something truly unique.</p>
        <button className= 'bg-gradient-to-r from-primary to-secondary text-white font-bold py-2 px-4 rounded-full cursor-pointer transform transition-transform duration-200 hover:scale-105'>Order Now</button>
      </div>
    </main>
  )
}
