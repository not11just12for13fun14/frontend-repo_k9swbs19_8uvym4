import React from 'react'

export default function PizzaCard({ pizza, onAdd }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 w-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
        {pizza.image ? (
          <img src={pizza.image} alt={pizza.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-5xl">🍕</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-800">{pizza.name}</h3>
          <span className="text-orange-600 font-bold">${pizza.price.toFixed(2)}</span>
        </div>
        {pizza.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{pizza.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {pizza.vegetarian && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Vegetarian</span>
          )}
          {pizza.tags?.map((t, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{t}</span>
          ))}
        </div>
        <button
          onClick={() => onAdd(pizza)}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}
