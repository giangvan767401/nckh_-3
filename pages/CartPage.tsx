
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { useCartStore } from '../store';

const CartPage = () => {
  const { items, removeItem, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const discount = items.length > 1 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Mock API call for demo - in production use 'api' from services
      // const res = await api.post('/payments/checkout', { courseIds: items.map(i => i.id) });
      // window.location.href = res.data.url;
      
      console.log("Triggering checkout for:", items.map(i => i.id));
      
      // Simulate redirection to Stripe
      setTimeout(() => {
        alert("Redirecting to Stripe Secure Checkout...");
        // After payment, clear cart (Note: ideally done after webhook, but safe to clear here)
        clearCart();
        navigate('/dashboard?payment=success');
        setIsProcessing(false);
      }, 1500);
    } catch (err) {
      alert("Checkout initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 inline-block shadow-sm">
          <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added any courses yet.</p>
          <Link to="/courses" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Explore Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
        Shopping Cart <span className="text-sm font-normal text-slate-500">({items.length} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-6 hover:border-indigo-300 transition-all shadow-sm">
              <div className="w-full sm:w-48 aspect-video bg-slate-100 rounded-xl overflow-hidden shrink-0">
                <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 italic mb-4">By {item.instructor}</p>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1 text-indigo-600"><Zap className="w-3 h-3" /> Lifetime Access</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Certificate Included</span>
                </div>
              </div>
              <div className="text-right sm:min-w-[100px]">
                <div className="text-2xl font-black text-slate-900">${item.price}</div>
                <div className="text-xs text-slate-400 line-through">${(item.price * 4).toFixed(2)}</div>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-red-500 font-bold hover:underline">Clear Shopping Cart</button>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-600">
                <span>Original Price</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Multi-course Discount (10%)</span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-black text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Checkout <ArrowRight className="w-5 h-5" /></>}
            </button>
            
            <p className="text-xs text-center text-slate-400 font-medium">
              By completing your purchase, you agree to our <br />
              <span className="underline cursor-pointer">Terms of Service</span>.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-widest text-slate-400">Coupon Code</h4>
            <div className="flex gap-2">
              <input type="text" placeholder="LUMINA2024" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 text-sm font-bold uppercase" />
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
