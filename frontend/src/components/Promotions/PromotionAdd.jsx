import axios, { isCancel } from 'axios';
import React, { useState } from 'react'

export default function PromotionAdd() {

    const productId = localStorage.getItem('productPromoId');
    const [name, setName] = useState('');
    const [discountRate, setDiscountRate] = useState();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState({});
    const [message, setMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState(true);

    const savePromotion = async () => {
        let isValid = true;
        const currentError = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(startDate);
        const end = new Date(endDate);

        if(!name.trim()) {
            currentError.name = 'Please enter a valide name';
            isValid = false;
        }
        const discount = parseFloat(discountRate);
        if (!discountRate || isNaN(discount) || discount <= 0 || discount > 100){
            currentError.discountRate = 'Please enter a valide discount rate';
            isValid = false;
        }
        if (!startDate) {
            currentError.startDate = 'Start date is required';
            isValid = false;
        } else if (start < today) {
            currentError.startDate = 'Start date must be today or later';
            isValid = false;
        }

        if (!endDate) {
            currentError.endDate = 'End date is required';
            isValid = false;
        } else if (end < start) {
            currentError.endDate = 'End date must be after start date';
            isValid = false;
        }


        if(!isValid) {
            setError(currentError);
            return;
        } 
        
        const promotion = {
            product: Number(productId), 
            name,
            discount_rate: discountRate,
            start_date: startDate,
            end_date: endDate
        }

        try {
            const res = await axios.post('http://localhost:8000/api/promotions/', promotion);
            if(res.status === 200 || res.status === 201) {
                setMessage('Promotion added successfully.');
                setMessageStatus(false);
                setTimeout(() => {
                    setMessage('');
                }, 2000);
                window.location.href = '/Promotions'
            } else {
                setMessage('Something went wrong while adding the promotion.');
                setMessageStatus(true);
            }
            
        } catch (error) {
            if (error.response) {
                // Accès direct à non_field_errors (qui est un tableau)
                const nonFieldErrors = error.response.data.non_field_errors;
                const startDateErros = error.response.data.end_date;

                // Si c'est un tableau, tu peux l'afficher ou concaténer
                if (nonFieldErrors && nonFieldErrors.length > 0) {
                    setMessage(nonFieldErrors.join(' '));  // met les erreurs dans un string
                } 
                else if (startDateErros && startDateErros.length > 0) {
                    setMessage(startDateErros.join(' '));
                } else {
                    setMessage(JSON.stringify(error.response.data)); // fallback
                }

            } else {
                console.log('Error:', error);
                setMessage('Something went wrong.');
            }
            setMessageStatus(true);
        }

        
    }

    return (
        <div className=" dark:bg-gray-900 dark:text-white flex justify-center">
            <div className="py-4 px-8 border-2 border-secondary rounded-lg my-5 w-1/3">
                <h2 className="text-2xl font-medium mb-7 text-center text-secondary">Add Promotion</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Promotion name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    /> 

                    <div className="mb-5 text-primary">
                        {error.name}
                    </div>
                </div>
                <div className="mb-4">
                    <input
                        placeholder="Discount (%)"
                        type='number'
                        value={discountRate || ''}
                        onChange={(e) => setDiscountRate(e.target.value)}
                        className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    /> 

                    <div className="mb-5 text-primary">
                        {error.discountRate}
                    </div>
                </div>
                <div className="mb-4">
                    <input
                        type='date'
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    /> 

                    <div className="mb-5 text-primary">
                        {error.startDate}
                    </div>
                </div>
                <div className="mb-4">
                    <input
                        type='date'
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    /> 

                    <div className="mb-5 text-primary">
                        {error.endDate}
                    </div>
                </div>
                

               
                <div className="mb-4 flex flex-col gap-3">
                    <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
                    <button
                    onClick={savePromotion}
                    className="px-4 py-2 w-full rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
                    >
                        Add Promotion
                    </button>
                </div>
            </div>
        </div>
    )
}
