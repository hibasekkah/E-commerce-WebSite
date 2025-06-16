import React from 'react'

export default function PromotionAdd() {

    const productId = localStorage.getItem('productPromoId');
    return (
        <div>PromotionAdd ${productId}</div>
    )
}
