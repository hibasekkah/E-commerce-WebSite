import React from 'react';
import {Trash2} from 'lucide-react';

const hasProd = (catProds, type) => {
    if (type === 'category') {
        // Cas 1 : catégorie sans sous-catégories
        if (Array.isArray(catProds.products) && catProds.products.length > 0) {
            return true;
        }

        // Cas 2 : catégorie avec sous-catégories
        if (Array.isArray(catProds.content)) {
            for (const subCat of catProds.content) {
            if (Array.isArray(subCat.products) && subCat.products.length > 0) {
                return true;
            }
            }
        }
    }
    if (type === 'subCategory' && Array.isArray(catProds.products) && catProds.products.length > 0) {
        return true;
    }
  
  // Aucun produit trouvé
  return false;
};


export default function CatProdDelete({ catProds, delay }) {
  return (
    <div data-aos="zoom-in-up" data-aos-delay={delay}  className='flex flex-col justify-center items-center gap-3 mt-8'>
      <h1 className='text-3xl text-primary font-dancing font-semibold'>{catProds.name}</h1>
      { hasProd(catProds, 'category') ? 
        <table className='table-auto w-3/5 border-2 border-primary rounded text-lg'>
            <tbody>
            {
                catProds?.content ? 
                    (catProds.content.map((subCat) => (
                    <React.Fragment key={subCat.id}>
                    <tr className='text-center bg-primary/40 font-semibold font-merienda'>
                        <td colSpan="2" className='py-4'>{subCat.name}</td>
                    </tr>
                    {   hasProd(subCat, 'subCategory') ?
                        subCat.products.map((prod) => {
                            return (
                                <tr key={prod.id} className='border-b-2 border-primary'>
                                    <td className=' py-2 pl-5 flex gap-4'>
                                        <button className='text-secondary'><Trash2 /></button>
                                        <p>{prod.name}</p>
                                    </td>
                                </tr>
                            );
                        }) :    <tr colSpan={2}>
                                    <td className='text-center py-3 text-primary font-semibold'>There are no products in this subcategory yet.</td>
                                </tr>
                    }
                    </React.Fragment>
                ))
                ) : (
                catProds.products.map((prod) => (
                    <tr key={prod.id} className='border-b-2 border-primary'>
                        <td className=' py-2 pl-5 flex gap-4'>
                            <button className='text-secondary'><Trash2 /></button>
                            <p>{prod.name}</p>
                        </td>
                    </tr>
                ))
                )
            }
            </tbody>
        </table>
        : <p className='bg-primary/40 p-2 font-semibold text-lg'>There are no products in this category yet.</p>
        }
      
    </div>
  );
}
