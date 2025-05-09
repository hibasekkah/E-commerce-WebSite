import React from 'react'
import { MdLightMode } from "react-icons/md";

export default function DarkMode() {
  const [theme, setTheme] = React.useState(
    localStorage.getItem('theme') ? localStorage.getItem('theme') : "light"
  )

  const element = document.documentElement;// html element

  React.useEffect(() => {
    if(theme === 'dark') {
      element.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      element.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme])

  return (
    <div className='relative'>
      <MdLightMode 
        onClick={() => {setTheme(theme === 'light' ? 'dark' : 'light')}}
        className='text-2xl cursor-pointer drop-shadow-[1px_1px_1px_rgba(0, 0, 0, 0.1)] transition-all duration-300  absolute top-1/2 -translate-y-1/2 right-0'
      />
     
    </div>
  )
}
