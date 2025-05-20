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
import ProductCard from "./components/Product/ProductCard";
import image1 from './assets/Products/Caftan.jpg'
import image2 from './assets/Products/Balgha.jpg'
import image3 from './assets/Products/Tarbouche.jpg'

const Products = [
    {
        image: image1,
        description: "Women's Caftan – Royal Blue Color with Gold and Silver Embroidery",
        rating: 3
    }, {
        image: image2, 
        description: "Men's Babouche – Classic Black Leather",
        rating: 4.5
    }, {
        image: image3, 
        description: "Men's Tarbouche – Traditional Red Fez Hat with Elegant Black Tassel",
        rating: 3.5
    }
];

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
          <Routes>
            {/* Define routes for your pages */}
            <Route path='/about' element={
              <About />
            } />
            <Route path='/' element={
              <div>
                <div style={bgImage} className="min-h-screen">
                  <Hero />
                </div>
                <Category />
                <hr className="my-2 mx-80 border-primary border-t-2"/>
                <About />
              </div>
            } />
          </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
