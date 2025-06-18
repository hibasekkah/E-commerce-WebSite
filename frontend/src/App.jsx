import { useEffect, useState } from "react";
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
import NavbarGuest from "./components/Navbar/NavbarGuest";
import NavbarClient from "./components/Navbar/NavbarClient";
import NavbarAdmin from "./components/Navbar/NavbarAdmin";
import SidebarAccount from "./components/Sidebar/SidebarAccount";
import AdminPage from "./components/AdminPage";
import Addresses from "./components/Account/Addresses";
import ProfilePage from "./components/Account/ProfilePage";
import PasswordPage from "./components/Account/PasswordPage";
import SidebarProduct from "./components/Sidebar/SidebarProduct";
import AddProdPage from "./components/Product/AddProdPage";
import VariantProdPage from "./components/Product/VariantProdPage";
import ProdDeletePage from "./components/Product/ProdDeletePage";
import AddQuantityProdPage from "./components/Product/AddQuantityProdPage";
import Promotions from "./components/Promotions/Promotions";
import PromotionAdd from "./components/Promotions/PromotionAdd";
import CategoryPage from "./components/Category/CategoryPage";
import ProductDetails from "./components/Product/ProductDetails";
import CartPage from "./components/Cart/CartPage";


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

  const role = localStorage.getItem('role') || '';
  const username = localStorage.getItem('username') || '';

  return (
    <div className="dark:bg-gray-900 dark:text-white">
      <Router>
        { username !== '' ? ( role === 'Customer' ? <NavbarClient username={username} /> : <NavbarAdmin username={username}/>) : <NavbarGuest />}
          <Routes>
            {/* Define routes for your pages */}
            <Route path='/about' element={
              <About />
            } />
            <Route path='/' element={
              role === 'Admin' ? <AdminPage /> :
              <div>
                <div style={bgImage} className="min-h-screen">
                  <Hero />
                </div>
                <Category />
                <hr className="my-2 mx-80 border-primary border-t-2"/>
                <About />
              </div>
            } />
            <Route path='/Account' element={
              <div className="flex">
                <SidebarAccount />
              </div>
            }/>
            <Route path='/Profile' element={
              <ProfilePage />
            } />
            <Route path='/ChangePasswordPage' element={
              <PasswordPage />
            } />
            <Route path='/Addresses' element={
              <div className="flex">
                <SidebarAccount />
                <Addresses />
              </div>
            } />
            <Route path='/Product'  element = {
              <div className="flex">
                <SidebarProduct />
              </div>
            }/>
            <Route path='/Product/Add' element = {
              <AddProdPage />
            } />
            <Route path='/Product/Add/Variants' element = {
              <VariantProdPage />
            } />
            <Route path='/Product/Delete' element = {
              <ProdDeletePage />
            } />
            <Route path='/Product/Add/Quantity' element = {
              <AddQuantityProdPage />
            } />
            <Route path='/Promotions' element = {
              <Promotions />
            } />
            <Route path="/Promotions/Add" element = {
              <PromotionAdd />
            }/>
            <Route path="/Category/:categoryName" element = {
              <CategoryPage />
            }/>
            <Route path="/Product/:categoryName/:id" element = {
              <ProductDetails />
            } />
            <Route path="/Cart" element = {
              <CartPage />
            } />
          </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
