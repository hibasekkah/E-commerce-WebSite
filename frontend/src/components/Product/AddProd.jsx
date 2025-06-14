import React, { useState } from 'react'

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

    const handleSave = () => {
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
            const productDetails = {
                name,
                description,
                category,
                ...(subCategory && { subCategory }),
            };

            localStorage.setItem('productDetails', JSON.stringify(productDetails));

            window.location.href = '/Product/Add/Variants';
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
