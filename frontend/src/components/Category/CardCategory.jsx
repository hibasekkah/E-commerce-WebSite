import React from 'react'
import BrowseButton from '../BrowseButton'

export default function CardCategory({line1, line2, line3, ImageCategory, delay}) {
  return (
    <div data-aos="zoom-in-up" data-aos-delay={delay} className='py-10 pl-5 bg-gradient-to-br from-primary/40 to-secondary/90 rounded-3xl relative h-[320px] w-[280px] flex items-start shadow-xl'>
      <div>
        <div className='mb-4'>
          <p className='mb-[2px]'>{line1}</p>
          <p className='text-xl font-semibold mb-[1px]'>{line2}</p>
          <p className='text-xl xl:text-2xl mb-10 font-semibold'>{line3}</p>
          <BrowseButton />
        </div>
      </div>
      <img src={ImageCategory} alt="" className='h-[200px] absolute bottom-0 right-0' />
    </div>
  )
}
