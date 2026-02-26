import { useState } from 'react'
import { Plus, Minus, ShoppingCart, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { ProductImageGallery } from './ProductImageGallery'
import { useCart } from './CartContext'

export function ProductCard({ p, whatsappPhone, isMLM }: any) {
    const [quantity, setQuantity] = useState(1)
    const [showFullDesc, setShowFullDesc] = useState(false)
    const [added, setAdded] = useState(false)
    const { addToCart } = useCart()

    const handleAddToCart = () => {
        addToCart({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            currency: p.currency,
            quantity: quantity,
            points: Number(p.points || 0),
            image: p.images?.[0]
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div className="group flex flex-col bg-white rounded-2xl sm:rounded-[40px] overflow-hidden border-2 border-slate-200/60 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700">
            {/* Image Gallery */}
            <div className="relative group">
                <ProductImageGallery images={p.images} name={p.name} />
                {isMLM && p.points > 0 && (
                    <div className="absolute top-2 right-2 sm:top-6 sm:right-6 bg-blue-600 text-white text-[7px] sm:text-[9px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1">
                        <Star size={8} className="sm:size-[10px]" /> {p.points} PV
                    </div>
                )}
                {p.stock > 0 && p.stock <= 5 && (
                    <div className="absolute top-2 left-2 sm:top-6 sm:left-6 bg-slate-950 text-white text-[7px] sm:text-[9px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest shadow-xl">Últimos {p.stock}</div>
                )}
            </div>

            <div className="p-4 sm:p-8 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 text-sm sm:text-xl mb-1 sm:mb-2 line-clamp-2 leading-tight tracking-tight">{p.name}</h3>

                {/* Description toggle */}
                <div className="mb-4 sm:mb-6">
                    <p className={`text-slate-400 text-[10px] sm:text-xs font-medium leading-relaxed transition-all duration-500 ${showFullDesc ? '' : 'line-clamp-2'}`}>
                        {p.description}
                    </p>
                    {p.description?.length > 40 && (
                        <button
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-[10px] sm:text-xs font-bold text-slate-950 mt-1.5 flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                            {showFullDesc ? 'Ver menos' : 'Ver descripción'}
                            {showFullDesc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    )}
                </div>

                <div className="mt-auto space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-1.5 border-2 border-slate-200/60">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cantidad</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border-2 border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-slate-950 w-6 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border-2 border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5">Total</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-950 leading-none tracking-tighter">
                                {p.currency === 'PEN' ? 'S/' :
                                    p.currency === 'BOB' ? 'Bs' :
                                        p.currency === 'VES' ? 'Bs.S' :
                                            p.currency === 'EUR' ? '€' : '$'}
                                {(p.price * quantity).toLocaleString()}
                            </span>
                            {isMLM && p.points > 0 && (
                                <span className="text-[8px] sm:text-[10px] font-bold text-blue-600 mt-1 flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> +{(p.points * quantity)} PV
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] group font-black text-[10px] sm:text-xs uppercase tracking-widest ${added ? 'bg-green-500 text-white' : 'bg-slate-950 text-white hover:bg-slate-800'
                                }`}
                        >
                            <ShoppingCart size={16} className={added ? 'animate-bounce' : 'group-hover:translate-x-1 transition-transform'} />
                            {added ? '¡Añadido!' : 'Añadir'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
