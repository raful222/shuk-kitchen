import React, { useState } from 'react';
import { 
  ShoppingCart, ExternalLink, Copy, Check, Plus, Minus, 
  Package, DollarSign, Sparkles, Filter, AlertCircle 
} from 'lucide-react';
import { generateWhatsAppShoppingList } from '../utils/helpers';

export default function GroceriesTab({
  products = [],
  onUpdateStock,
  onAddProduct,
  dailyMenu = {},
  todayAttendeesCount = 0,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('dry');
  const [newUnit, setNewUnit] = useState('יח\'');
  const [newPrice, setNewPrice] = useState('');
  const [newRequired, setNewRequired] = useState(1);

  const categories = [
    { id: 'all', label: 'הכל', icon: '🛒' },
    { id: 'meat', label: 'בשר ועופות', icon: '🍗' },
    { id: 'veg', label: 'ירקות ופירות', icon: '🥗' },
    { id: 'dry', label: 'יבשים ומזווה', icon: '🌾' },
    { id: 'cleaning', label: 'ניקיון וכלים', icon: '🧼' },
  ];

  // Calculations
  const itemsToBuy = products.filter(p => (p.requiredStock - p.currentStock) > 0);
  const totalEstimatedCost = itemsToBuy.reduce((sum, p) => {
    const qty = Math.max(0, p.requiredStock - p.currentStock);
    return sum + (qty * p.pricePerUnit);
  }, 0);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppShoppingList(products, dailyMenu, todayAttendeesCount);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddNewProduct = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddProduct({
      id: `prod-custom-${Date.now()}`,
      category: newCategory,
      name: newName.trim(),
      unit: newUnit,
      pricePerUnit: parseFloat(newPrice) || 0,
      requiredStock: Number(newRequired) || 1,
      currentStock: 0,
      shukNote: 'נוסף ע"י הצוות',
      link: 'https://www.mck.co.il',
    });

    setNewName('');
    setNewPrice('');
    setNewRequired(1);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">
      
      {/* 🛒 SHUK SHOPPING HERO SUMMARY */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <div>
              <h2 className="font-black text-base">קניות מחסני השוק</h2>
              <p className="text-xs text-orange-100">מוצרים קבועים וספירת מלאי</p>
            </div>
          </div>

          <a
            href="https://www.mck.co.il"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-full border border-white/20 transition active:scale-95"
          >
            <span>אתר השוק</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3">
            <span className="text-[11px] text-orange-200 block font-medium">מוצרים להזמנה:</span>
            <span className="text-2xl font-black text-white">{itemsToBuy.length}</span>
            <span className="text-xs text-orange-200 mr-1">פריטים חסרים</span>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3">
            <span className="text-[11px] text-orange-200 block font-medium">עלות משוערת:</span>
            <span className="text-2xl font-black text-white">~{Math.round(totalEstimatedCost)}</span>
            <span className="text-xs text-orange-200 mr-1">₪</span>
          </div>
        </div>

        {/* WhatsApp Export Button */}
        <button
          onClick={handleCopyWhatsApp}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-orange-700 hover:bg-orange-50'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>הרשימה הועתקה! פתח וואטסאפ והדבק בקבוצה ✓</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-orange-600" />
              <span>העתק רשימת קניות מנוסחת לוואטסאפ 📲</span>
            </>
          )}
        </button>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* PRODUCTS LIST */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-slate-700">
            {filteredProducts.length} מוצרים {activeCategory !== 'all' ? 'בקטגוריה' : ''}
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף מוצר קבוע</span>
          </button>
        </div>

        {filteredProducts.map(product => {
          const qtyNeeded = Math.max(0, product.requiredStock - product.currentStock);
          const isMissing = qtyNeeded > 0;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl p-3.5 border transition-all ${
                isMissing 
                  ? 'border-orange-200 shadow-xs' 
                  : 'border-slate-200/80 bg-slate-50/40 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{product.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>מחיר: ~{product.pricePerUnit} ₪ ל-{product.unit}</span>
                    <span>•</span>
                    <span>יעד: {product.requiredStock} {product.unit}</span>
                  </div>
                  {product.shukNote && (
                    <p className="text-[10px] text-orange-800/80 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-1">
                      {product.shukNote}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                  isMissing 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {isMissing ? `להזמין: ${qtyNeeded} ${product.unit}` : 'קיים במלאי ✓'}
                </span>
              </div>

              {/* Stock counter stepper */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  כמה נשאר במקרר/מזווה?
                </span>

                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => onUpdateStock(product.id, Math.max(0, product.currentStock - (product.unit === 'ק"ג' ? 0.5 : 1)))}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs active:scale-90 hover:bg-slate-200 font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-14 text-center font-black text-xs text-slate-800">
                    {product.currentStock} {product.unit}
                  </span>

                  <button
                    onClick={() => onUpdateStock(product.id, product.currentStock + (product.unit === 'ק"ג' ? 0.5 : 1))}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs active:scale-90 hover:bg-slate-200 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ➕ ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-800">הוספת מוצר חדש למחסני השוק</h3>

            <form onSubmit={handleAddNewProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">שם המוצר:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="למשל: תבלין שווארמה / פפריקה..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">קטגוריה:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-800"
                  >
                    <option value="meat">🍗 בשר ועופות</option>
                    <option value="veg">🥗 ירקות</option>
                    <option value="dry">🌾 יבשים ומזווה</option>
                    <option value="cleaning">🧼 ניקיון וכלים</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">יחידת מידה:</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-800"
                  >
                    <option value="ק&quot;ג">ק"ג</option>
                    <option value="חבילה">חבילה</option>
                    <option value="בקבוק">בקבוק</option>
                    <option value="יחידה">יחידה</option>
                    <option value="מארז">מארז</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">מחיר משוער (₪):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">מלאי נדרש קבוע:</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={newRequired}
                    onChange={(e) => setNewRequired(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700"
                >
                  הוסף לרשימה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
