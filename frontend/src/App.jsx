import { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import BgImageMarrakech from "./assets/Marrakech.jpg";
import BgImageAllProd from "./assets/AllProd.jpg";
import BgImageCarpet from "./assets/Carpet.jpg";
import BgImageFez from "./assets/Fez.jpg";
import BgImageFoodProducts from './assets/FoodProducts.webp';
import Category from "./components/Category/Category";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";
import AOS from "aos";
import 'aos/dist/aos.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const images = [BgImageMarrakech, BgImageAllProd, BgImageCarpet, BgImageFez, BgImageFoodProducts];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // change image every 4 seconds

    return () => clearInterval(interval); // cleanup
  }, [images.length]);

  const bgImage = {
    backgroundImage: `url(${images[currentImageIndex]})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    height: "100vh",
    width: "100%",
    transition: "background-image 1s ease-in-out"
  };

  return (
    <div className="dark:bg-gray-900 dark:text-white">
      <Router>
        <Navbar />
        <div>
          <Routes>
          {/* Define routes for your pages */}
          <Route path='/about' element={
            <div>
              <About />
              <Footer />
            </div>
          } />
          <Route path='/' element={
            <div style={bgImage} className="min-h-screen">
              <Hero />
              <Category />
              <hr className="my-2 mx-80 border-primary border-t-2"/>
              <About />
              <Footer />
            </div>
          } />
        </Routes>
        </div>
        
        
      </Router>
    </div>
  );
}

export default App;
