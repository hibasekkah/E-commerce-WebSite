import React, { useState } from 'react'
import axios from "axios";

const categories = [
    {id: 1, name: 'Home Decor', subCategories: ["Home Furniture", "Accessories"]},
    {id: 2, name: 'Clothing & Textiles', subCategories: ["Clothes", "Textiles", "Shoes"]},
    {id: 3, name: 'Natural Cosmetics', subCategories: ["Creams and Gels", "Liquids", "Others"]},
    {id: 4, name: 'Accessories & Jewelry', subCategories:[]},
    {id: 5, name: 'Food & Spices', subCategories: ["Liquids", "Solids"]}
]

export default function AddProd() {

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [subCategory, setSubCategory] = useState('');
    const [message, setMessage] = useState("");
    const [messageStatus, setMessageStatus] = useState(false);
    

    const [eName, setEName] = useState('');
    const [eDescription, setEDescription] = useState('');
    const [eCategory, setECategory] = useState('');
    const [eSubCategory, SetESubCategory] = useState('');

    
    const handleCategoryChange = (e) => {
        const selectedName = e.target.value;
        const selectedCategory = categories.find(cat => cat.name === selectedName);
        if (selectedCategory) {
            setCategory(selectedCategory.name);
            setSubCategories(selectedCategory.subCategories);
        } else {
            setCategory('');
        }
    };

    const handleSave = async () => {
        let isValid = true;

        if (!name.trim()) {
            setEName('Please enter a valid product name.');
            isValid = false;
        } else {
            setEName('');
        }
        if (!description.trim()) {
            setEDescription('Please enter a valid product description.');
            isValid = false;
        } else {
            setEDescription('');
        }
        if (!category) {
            setECategory('Please select a product category.');
            isValid = false;
        } else {
            setECategory('');
        }
        if (category !== 'Accessories & Jewelry' && !subCategory) {
            SetESubCategory('Please select a product subcategory.');
            isValid = false;
        } else {
            SetESubCategory('');
        }
        if (isValid) {
            let idCat = null;
            if(category === 'Accessories & Jewelry' ) idCat = 12;
            else if(subCategory === 'Liquids') {
                if(category === 'Natural Cosmetics'){
                    idCat = 10;
                } else if(category === 'Food & Spices'){
                    idCat = 14;
                }
            }
            else {
                switch(subCategory){
                    case 'Home Furniture' : 
                        idCat = 2;
                        break;
                    case 'Accessories' : 
                        idCat = 3;
                        break;
                    case 'Clothes' : 
                        idCat = 5;
                        break;
                    case 'Textiles' : 
                        idCat = 6;
                        break;
                    case 'Shoes' : 
                        idCat = 7;
                        break;
                    case 'Creams and Gels' : 
                        idCat = 9;
                        break;
                    case 'Others' : 
                        idCat = 11;
                        break;
                    case 'Solids': 
                        idCat = 15;
                        break;
                    default: 
                        idCat = null;
                }
            }
            const productDetails = {
                name,
                description,
                category,
                idCat,
                ...(subCategory && { subCategory }),
            };

            localStorage.setItem('productDetails', JSON.stringify(productDetails));

            const payload = {
                name,
                description,
                category: idCat
            }
            try {
                // Register the user
                const res = await axios.post("http://localhost:8000/api/products/", payload);

                if (res.status === 201 || res.status === 200) { //200 OK, 201 created
                    localStorage.setItem('productId', JSON.stringify(res.data.id));
                    setMessage("Product added successfully! Redirecting to variant setup...");
                    setTimeout(()=> {
                        window.location.href = '/Product/Add/Variants';
                    }, 2000);
                    setMessageStatus(false);
                } else {
                    setMessage("Failed to add product. Please try again.");
                    setMessageStatus(true);
                }
                } catch (error) {
                const messageError =
                    error.response?.data?.detail ||
                    Object.values(error.response?.data || {}).flat().join("\n") ||
                    "Something went wrong.";
                setMessage(messageError);
                setMessageStatus(true);
            }

            
        }
        
    }
    return (
        <div className=" dark:bg-gray-900 dark:text-white flex justify-center">
            <div className="py-4 px-8 border-2 border-secondary rounded-lg my-5 w-1/2">
                <h2 className="text-2xl font-medium mb-7 text-center text-secondary">Add Product</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Product name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    /> 

                    <div className="mb-5 text-primary">
                        {eName}
                    </div>
                </div>
                <div className="mb-4">
                    <textarea
                        placeholder="Product description"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    /> 

                    <div className="mb-5 text-primary">
                        {eDescription}
                    </div>
                </div>
                
                <div className="mb-4">
                    <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e)}
                    className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                    <option value="">Select Category</option>
                    {categories.map((element) => (
                        <option key={element.id} value={element.name}>{element.name}</option>
                    ))}
                    </select>
                    <div className="mb-5 text-primary">
                        {eCategory}
                    </div>
                </div>
                {
                    subCategories.length > 0 && 
                    (
                        <div className="mb-4">
                            <select
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            >
                                <option value="">Select Sub Category</option>
                                {subCategories.map((element, index) => (
                                    <option key={index} value={element}>{element}</option>
                            ))}
                            </select>
                            <div className="mb-5 text-primary">
                                {eSubCategory}
                            </div>
                        </div>
                    )
                }

               
                <div className="mb-4 flex flex-col gap-3">
                    <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
                    <button
                    onClick={handleSave}
                    className="px-4 py-2 w-full rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
                    >
                        Next : Add Product Variants
                    </button>
                </div>
            </div>
        </div>
    )
}
