import { useEffect, useState } from "react"
import Navbar from "./components/Navbar/Navbar"
import Hero from "./components/Hero/Hero"
import BgImageMarrakech from "./assets/Marrakech.jpg"
import BgImageAllProd from "./assets/AllProd.jpg"
import BgImageCarpet from "./assets/Carpet.jpg"
import BgImageFez from "./assets/Fez.jpg"
import BgImageFoodProducts from './assets/FoodProducts.webp'
import Category from "./components/Category/Category"

function App() {
  const images = [BgImageMarrakech, BgImageAllProd, BgImageCarpet, BgImageFez,BgImageFoodProducts];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // change image every 5 seconds

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
    <div>
      <div style={bgImage}>
      <Navbar />
      <Hero />
      </div>
      <Category />
    </div>
    
  );
}

export default App;
