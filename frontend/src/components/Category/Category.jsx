import React from 'react'
import Category1 from "../../assets/Category/Leather_Craft_Category.png"
import BrowseButton from '../BrowseButton'

export default function Category() {
  return (
    <div className='py-8 dark:bg-gray-900 dark:text-white '>
      <div className='container'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* first col */}
          <div className='py-10 pl-5 bg-gradient-to-br from-primary/40 to-secondary/90 rounded-3xl relative h-[320px] w-[300px] flex items-start'>
            <div>
              <div className='mb-4'>
                <p className='mb-[2px]'>Stand Out</p>
                <p className='text-2xl font-semibold mb-[1px]'>With</p>
                <p className='text-2xl xl:text-3xl mb-10 font-bold '>Leather Craft</p>
                <BrowseButton />
              </div>
            </div>
            <img src={Category1} alt="" className='w-[200px] absolute bottom-2 right-0' />
          </div>
          {/* second col */}
          {/* third col */}
        </div>
      </div>
    </div>
  )
}
