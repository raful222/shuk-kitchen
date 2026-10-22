import React, { useState } from 'react';
import { 
  ShoppingCart, ExternalLink, Copy, Check, Plus, Minus, 
  Package, DollarSign, Sparkles, Filter, AlertCircle,
  Search, Zap, ChevronRight, ChevronLeft, X, RotateCcw, CheckSquare,
  LayoutList, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { generateWhatsAppShoppingList } from '../utils/helpers';

export default function GroceriesTab({
  products = [],
  onUpdateStock,
  onResetAllStock,
  onAddProduct,
  dailyMenu = {},
  todayAttendeesCount = 0,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'missing' | 'inStock'
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderWizard, setShowOrderWizard] = useState(false);
  const [wizardIndex, setWizardIndex] = useState(0);
  const [checkedProductIds, setCheckedProductIds] = useState({});

  // New product form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('dry');
  const [newUnit, setNewUnit] = useState('יח\'');
  const [newPrice, setNewPrice] = useState('');
  const [newRequired, setNewRequired] = useState(1);

  const categories = [
    { id: 'all', label: 'הכל', icon: '🛒' },
    { id: 'meat', label: 'בשר ועופות', icon: '🍗' },
    { id: 'dry', label: 'יבשים ותוספות', icon: '🌾' },
    { id: 'veg', label: 'ירקות ופירות', icon: '🥗' },
    { id: 'drinks', label: 'שתייה וחלב', icon: '🥤' },
    { id: 'cleaning', label: 'ניקיון וכלים', icon: '🧼' },
  ];

  // Calculations: How much is in stock vs how much is needed
  const itemsToBuy = products.filter(p => (p.requiredStock - p.currentStock) > 0);
  const itemsInStock = products.filter(p => p.currentStock >= p.requiredStock);
  const totalEstimatedCost = itemsToBuy.reduce((sum, p) => {
    const qty = Math.max(0, p.requiredStock - p.currentStock);
    return sum + (qty * p.pricePerUnit);
  }, 0);

  const categoryFiltered = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const filteredProducts = categoryFiltered.filter(p => {
    if (stockStatusFilter === 'missing') return (p.requiredStock - p.currentStock) > 0;
    if (stockStatusFilter === 'inStock') return p.currentStock >= p.requiredStock;
    return true;
  });

  const activeOrderList = itemsToBuy.length > 0 ? itemsToBuy : products;
  const currentWizardItem = activeOrderList[wizardIndex] || activeOrderList[0];
  const currentItemQty = currentWizardItem ? Math.max(1, currentWizardItem.requiredStock - currentWizardItem.currentStock) : 1;

  const [plainCopied, setPlainCopied] = useState(false);
  const [showShukApiNotice, setShowShukApiNotice] = useState(false);

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppShoppingList(products, dailyMenu, todayAttendeesCount);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPlainList = () => {
    if (itemsToBuy.length === 0) {
      alert('אין מוצרים חסרים להזמנה כרגע!');
      return;
    }
    let text = `🛒 רשימת הזמנה למחסני השוק (${itemsToBuy.length} פריטים):\n`;
    itemsToBuy.forEach(item => {
      const qty = item.requiredStock - item.currentStock;
      text += `• ${item.name}: להזמין ${qty} ${item.unit}\n`;
    });
    navigator.clipboard.writeText(text);
    setPlainCopied(true);
    setTimeout(() => setPlainCopied(false), 2500);
  };

  const handleOpenOrderWizard = () => {
    let currentItems = itemsToBuy;
    if (currentItems.length === 0) {
      if (window.confirm('אין כרגע מוצרים חסרים להזמנה במלאי. האם לסמן את כל המוצרים הקבועים להזמנה שבועית חדשה?')) {
        onResetAllStock && onResetAllStock('zero');
      } else {
        return;
      }
    }

    // Copy formatted list to clipboard
    let text = `🛒 רשימת הזמנה למחסני השוק (${itemsToBuy.length || products.length} פריטים):\n`;
    (itemsToBuy.length > 0 ? itemsToBuy : products).forEach(item => {
      const qty = Math.max(1, item.requiredStock - item.currentStock);
      text += `• ${item.name}: להזמין ${qty} ${item.unit}\n`;
    });
    navigator.clipboard.writeText(text);
    setPlainCopied(true);
    setTimeout(() => setPlainCopied(false), 2500);

    setWizardIndex(0);
    setShowOrderWizard(true);
  };

  const handleOpenAllShukTabs = () => {
    const list = itemsToBuy.length > 0 ? itemsToBuy : products;
    if (list.length === 0) return;
    list.forEach((item, idx) => {
      setTimeout(() => {
        window.open(`https://www.mck.co.il/search?q=${encodeURIComponent(item.name)}`, '_blank');
      }, idx * 180);
    });
  };

  const toggleItemChecked = (id) => {
    setCheckedProductIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowShukApiNotice(!showShukApiNotice)}
              className="bg-black/20 hover:bg-black/30 text-white text-[10px] font-bold px-2 py-1.5 rounded-full border border-white/20"
              title="הסבר על חיבור אוטומטי לעגלת השוק"
            >
              איך מזמינים? 💡
            </button>
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
        </div>

        {/* Info on how supermarket cart integration works */}
        {showShukApiNotice && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 text-[11px] text-orange-100 space-y-1.5 border border-white/20">
            <div className="font-bold text-amber-200">
              💡 למה אי אפשר להוסיף אוטומטית לסל במחסני השוק דרך API?
            </div>
            <p className="leading-relaxed">
              אתרי הסופרמרקטים בישראל (מחסני השוק, שופרסל, ויקטורי) אינם מאפשרים לאפליקציה חיצונית להכניס מוצרים ישירות לעגלה הפרטית של הלקוח מטעמי אבטחת מידע, סייבר ודרישת התחברות אישית עם סיסמה.
            </p>
            <p className="leading-relaxed font-semibold text-white">
              במקום זה הכנו לכם את הפתרון המושלם: לצד כל מוצר שחסר מופיע כפתור "חפש והוסף באתר השוק" שפותח מיד את דף המוצר להוספה מהירה, ובנוסף כפתור להעתקת רשימת ההזמנה בלחיצה אחת!
            </p>
          </div>
        )}

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

        {/* Primary Action: Add all list & Open Shuk */}
        <button
          type="button"
          onClick={handleOpenOrderWizard}
          className="w-full py-3 px-4 bg-white hover:bg-amber-50 text-orange-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98 border-2 border-white/90"
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>⚡ פתח את כל הרשימה במחסני השוק 🛒</span>
        </button>

        {/* Action Buttons: WhatsApp & Plain Copy */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyWhatsApp}
            className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>הועתק לוואטסאפ ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-orange-200" />
                <span>העתק לוואטסאפ 📲</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyPlainList}
            className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 border border-white/30 ${
              plainCopied
                ? 'bg-emerald-500 text-white'
                : 'bg-black/25 text-white hover:bg-black/35'
            }`}
          >
            {plainCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>הרשימה הועתקה!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-orange-200" />
                <span>העתק רשימת פריטים</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔄 STOCK CONTROLS: Add all to order or reset */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('האם לסמן את כל המוצרים הקבועים כחסרים להזמנה שבועית חדשה (איפוס מלאי ל-0)?')) {
              onResetAllStock && onResetAllStock('zero');
            }
          }}
          className="flex-1 py-1.5 px-2 bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-200 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition active:scale-95 shadow-2xs"
          title="כל המוצרים הקבועים ייכנסו לרשימת ההזמנה"
        >
          <span>➕ סמן את כל הרשימה להזמנה</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('האם לסמן שכל המוצרים קיימים במלואם במלאי?')) {
              onResetAllStock && onResetAllStock('full');
            }
          }}
          className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 shadow-2xs"
          title="אפס למלאי מלא"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>סמן שהכל במלאי</span>
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

      {/* 📊 INVENTORY CONTROLS & "כמה יש וכמה נשאר" VIEW SWITCHER */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                viewMode === 'cards'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>כרטיסים</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                viewMode === 'table'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>כמה יש וכמה נשאר 📊</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף מוצר</span>
          </button>
        </div>

        {/* Quick stock status filter pills */}
        <div className="flex items-center gap-1.5 px-1 overflow-x-auto no-scrollbar text-[11px]">
          <button
            type="button"
            onClick={() => setStockStatusFilter('all')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition ${
              stockStatusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            הכל ({categoryFiltered.length})
          </button>

          <button
            type="button"
            onClick={() => setStockStatusFilter('inStock')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
              stockStatusFilter === 'inStock'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>🟢 יש במלאי</span>
            <span>({categoryFiltered.filter(p => p.currentStock >= p.requiredStock).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setStockStatusFilter('missing')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
              stockStatusFilter === 'missing'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>🔴 חסר להזמנה</span>
            <span>({categoryFiltered.filter(p => p.currentStock < p.requiredStock).length})</span>
          </button>
        </div>
      </div>

      {/* 📊 VIEW 1: TABLE MODE ("כמה יש וכמה נשאר") */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <div>
                <h4 className="font-black text-xs">מאזן מלאי שבועי: כמה יש וכמה נשאר</h4>
                <p className="text-[10px] text-slate-300">עדכון ישיר בלחיצה על + ו- כשאוכלים או מבשלים</p>
              </div>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {filteredProducts.length} מוצרים
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-black">
                  <th className="p-3">שם מוצר</th>
                  <th className="p-3 text-center">כמה יש במלאי</th>
                  <th className="p-3 text-center">יעד נדרש</th>
                  <th className="p-3 text-center">נשאר / חסר</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-400 text-xs italic">
                      אין מוצרים התואמים לסינון שנבחר
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const diff = product.currentStock - product.requiredStock;
                    const isEnough = diff >= 0;
                    const unitDecimals = product.unit === 'ק"ג' ? 1 : 0;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-800">
                          <div className="leading-tight">{product.name}</div>
                          {product.shukNote && (
                            <span className="text-[9px] text-slate-400 block font-normal mt-0.5">
                              {product.shukNote}
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onUpdateStock(product.id, Math.max(0, product.currentStock - (product.unit === 'ק"ג' ? 0.5 : 1)))}
                              className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs font-bold text-xs hover:bg-slate-200 active:scale-95"
                              title="הפחת 1"
                            >
                              -
                            </button>
                            <span className="font-black text-xs px-1 text-slate-900 min-w-12 text-center">
                              {product.currentStock} {product.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateStock(product.id, product.currentStock + (product.unit === 'ק"ג' ? 0.5 : 1))}
                              className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs font-bold text-xs hover:bg-slate-200 active:scale-95"
                              title="הוסף 1"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-center whitespace-nowrap font-bold text-slate-500">
                          {product.requiredStock} {product.unit}
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          {isEnough ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                              <span>יש מספיק</span>
                              {diff > 0 && <span>(+{diff.toFixed(unitDecimals)})</span>}
                              <span>✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                              <span>חסר</span>
                              <span>{Math.abs(diff).toFixed(unitDecimals)} {product.unit}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 🎴 VIEW 2: CARDS MODE */
        <div className="space-y-2.5">
          {filteredProducts.map(product => {
            const qtyNeeded = Math.max(0, product.requiredStock - product.currentStock);
            const isMissing = qtyNeeded > 0;
            const diff = product.currentStock - product.requiredStock;

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
                      <span>יעד קבוע: {product.requiredStock} {product.unit}</span>
                    </div>
                    {product.shukNote && (
                      <p className="text-[10px] text-orange-800/80 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        {product.shukNote}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                    isMissing 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isMissing ? `חסר: ${qtyNeeded} ${product.unit}` : `יש מספיק במלאי ${diff > 0 ? `(+${diff})` : ''} ✓`}
                  </span>
                </div>

                {/* Stock counter stepper */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      כמה יש עכשיו במקרר / מזווה:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isMissing ? `צריך עוד ${qtyNeeded} להגעה ליעד` : `נשאר עודף של ${diff} מעל היעד`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => onUpdateStock(product.id, Math.max(0, product.currentStock - (product.unit === 'ק"ג' ? 0.5 : 1)))}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs active:scale-90 hover:bg-slate-200 font-bold"
                      title="הפחת 1 מהמלאי"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-14 text-center font-black text-xs text-slate-800">
                      {product.currentStock} {product.unit}
                    </span>

                    <button
                      onClick={() => onUpdateStock(product.id, product.currentStock + (product.unit === 'ק"ג' ? 0.5 : 1))}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs active:scale-90 hover:bg-slate-200 font-bold"
                      title="הוסף 1 למלאי"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick direct search link to Machsanei Hashuk if missing */}
                {isMissing && (
                  <div className="mt-2.5 pt-2 border-t border-dashed border-orange-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-orange-950 font-bold">
                      חסר {qtyNeeded} {product.unit} להזמנה
                    </span>
                    <a
                      href={`https://www.mck.co.il/search?q=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 rounded-xl text-[11px] font-extrabold transition active:scale-95 shadow-2xs"
                    >
                      <span>הוסף באתר השוק</span>
                      <ExternalLink className="w-3 h-3 text-orange-700" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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

      {/* 🚀 QUICK SHUK ORDER WIZARD MODAL */}
      {showOrderWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <div>
                  <h3 className="font-black text-sm text-slate-800">אשף הזמנה למחסני השוק</h3>
                  <p className="text-[11px] text-slate-500">{activeOrderList.length} מוצרים ברשימת ההזמנה</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderWizard(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification that list is copied */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 flex items-center gap-2 text-xs text-emerald-800 font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>כל רשימת המוצרים והכמויות הועתקה ללוח! 📋</span>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-700 block">
                פתיחה בלחיצה אחת:
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.mck.co.il"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-center font-bold text-xs shadow-md transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>פתח אתר מחסני השוק</span>
                </a>

                <button
                  type="button"
                  onClick={handleOpenAllShukTabs}
                  className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-center font-bold text-xs shadow-md transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>פתח הכל בטאבים 🚀</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                * כפתור "פתח הכל": פותח את עמודי החיפוש של כל המוצרים בטאבים נפרדים (אשר חלונות קופצים בדפדפן במידה ומופיעה הודעה).
              </p>
            </div>

            {/* Step-by-step assistant */}
            {currentWizardItem && (
              <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-950">
                    מוצר {wizardIndex + 1} מתוך {activeOrderList.length}:
                  </span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-black px-2 py-0.5 rounded-full">
                    {Math.round(((wizardIndex + 1) / activeOrderList.length) * 100)}%
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs space-y-1">
                  <h4 className="font-black text-xs text-slate-800 leading-snug">
                    {currentWizardItem.name}
                  </h4>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-black text-orange-700">
                      כמות להזמין: {currentItemQty} {currentWizardItem.unit}
                    </span>
                    <span className="text-slate-500 font-medium">
                      ~{Math.round(currentItemQty * currentWizardItem.pricePerUnit)} ₪
                    </span>
                  </div>
                  {currentWizardItem.shukNote && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5">
                      {currentWizardItem.shukNote}
                    </p>
                  )}
                </div>

                {/* Direct search link */}
                <a
                  href={`https://www.mck.co.il/search?q=${encodeURIComponent(currentWizardItem.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>חפש והוסף לסל באתר השוק ↗️</span>
                </a>

                {/* Navigation and item checkmark */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    type="button"
                    disabled={wizardIndex === 0}
                    onClick={() => setWizardIndex(prev => Math.max(0, prev - 1))}
                    className="flex-1 py-1.5 px-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-30 flex items-center justify-center gap-1"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>הקודם</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleItemChecked(currentWizardItem.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                      checkedProductIds[currentWizardItem.id]
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{checkedProductIds[currentWizardItem.id] ? 'סומן ✓' : 'סמן שהוספת'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={wizardIndex >= activeOrderList.length - 1}
                    onClick={() => setWizardIndex(prev => Math.min(activeOrderList.length - 1, prev + 1))}
                    className="flex-1 py-1.5 px-2 bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
                  >
                    <span>הבא</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Checklist of all items */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-extrabold text-slate-700 block">
                כל הפריטים ברשימה ({activeOrderList.length}):
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                {activeOrderList.map((item, idx) => {
                  const qty = Math.max(1, item.requiredStock - item.currentStock);
                  const isChecked = !!checkedProductIds[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setWizardIndex(idx)}
                      className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                        wizardIndex === idx ? 'bg-orange-100 font-bold text-orange-950' : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleItemChecked(item.id); }}
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            isChecked ? 'bg-emerald-600 text-white font-bold' : 'border border-slate-400'
                          }`}
                        >
                          {isChecked ? '✓' : ''}
                        </button>
                        <span className={`truncate text-[11px] ${isChecked ? 'line-through text-slate-400' : ''}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-orange-800 shrink-0 mr-1">
                        {qty} {item.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOrderWizard(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                סגור אשף הזמנה
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
