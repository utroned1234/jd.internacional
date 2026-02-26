'use client'

import React, { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { CartProvider, useCart } from './CartContext'
import { CartDrawer } from './CartDrawer'
import { LandingViewClient } from './LandingViewClient'
import { ProductCard } from './ProductCard'

export function StoreViewClient({ store, products, categories, phone, paymentQrUrl }: any) {
    return (
        <CartProvider>
            <StoreViewContent
                store={store}
                products={products}
                categories={categories}
                phone={phone}
                paymentQrUrl={paymentQrUrl}
            />
        </CartProvider>
    )
}

function StoreViewContent({ store, products, categories, phone, paymentQrUrl }: any) {
    const [isCartOpen, setIsCartOpen] = useState(false)
    const { totalItems, totalPoints, totalPrice, cart } = useCart()

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {store.type === 'LANDING' ? (
                <LandingViewClient
                    store={store}
                    product={products[0]}
                    phone={phone}
                    onOpenCart={() => setIsCartOpen(true)}
                />
            ) : (
                <CatalogView
                    store={store}
                    categories={categories}
                    phone={phone}
                    onOpenCart={() => setIsCartOpen(true)}
                    totalItems={totalItems}
                    totalPoints={totalPoints}
                    totalPrice={totalPrice}
                    cart={cart}
                />
            )}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                storeWhatsapp={phone}
                paymentQrUrl={paymentQrUrl}
                isMLM={store.type === 'NETWORK_MARKETING'}
            />
        </div>
    )
}

function CatalogView({ store, categories, phone, onOpenCart, totalItems, totalPoints, totalPrice, cart }: any) {
    const isMLM = store.type === 'NETWORK_MARKETING'
    const [activeCategory, setActiveCategory] = useState('Todos')

    const categoryList = ['Todos', ...Object.keys(categories)]

    return (
        <div className="animate-in fade-in duration-700">
            {/* Header Premium - Más compacto */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">
                        {store.name}
                    </h1>
                    <div className="flex items-center gap-3">
                        {isMLM && totalPoints > 0 && (
                            <div className="flex flex-col items-end">
                                <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Puntos PV</span>
                                <span className="text-xs sm:text-sm font-black text-blue-600 tracking-tighter leading-tight">+{totalPoints} PV</span>
                            </div>
                        )}
                        <button
                            onClick={onOpenCart}
                            className="relative flex items-center gap-3 px-4 py-2 bg-slate-950 text-white rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform group"
                        >
                            <div className="hidden sm:block text-right border-r border-white/10 pr-3 mr-1">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Subtotal</span>
                                <span className="block text-xs font-black tracking-tighter leading-none">
                                    {(cart[0]?.currency === 'PEN' ? 'S/' :
                                        cart[0]?.currency === 'BOB' ? 'Bs' :
                                            cart[0]?.currency === 'VES' ? 'Bs.S' :
                                                cart[0]?.currency === 'EUR' ? '€' : '$')}
                                    {totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="relative">
                                <ShoppingBag size={18} />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Category Navigation */}
            <nav className="max-w-7xl mx-auto px-6 py-8 border-b-2 border-slate-100/50 overflow-x-auto no-scrollbar">
                <div className="flex gap-4">
                    {categoryList.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                                ? 'bg-slate-950 text-white shadow-xl shadow-slate-200'
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Product Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-12">
                    {activeCategory === 'Todos' ? (
                        Object.values(categories).flat().map((p: any) => (
                            <ProductCard key={p.id} p={p} whatsappPhone={phone} isMLM={isMLM} />
                        ))
                    ) : (
                        (categories[activeCategory] || []).map((p: any) => (
                            <ProductCard key={p.id} p={p} whatsappPhone={phone} isMLM={isMLM} />
                        ))
                    )}
                </div>
            </main>

            {/* Global Footer */}
            <footer className="bg-slate-50 py-20 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-2xl font-black text-slate-950 mb-4 tracking-tighter uppercase italic">{store.name}</h2>
                    <p className="text-slate-400 text-sm font-medium">© 2026 JD INTERNACIONAL. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
