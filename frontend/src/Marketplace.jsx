import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Search, Filter, Plus, User, MapPin, Phone, 
  Trash2, Edit3, Camera, CheckCircle, Package, LogOut, Check
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/marketplace`;

const CATEGORIES = [
  { id: 'all' },
  { id: 'tools' },
  { id: 'machines' },
  { id: 'seeds' },
  { id: 'fertilizers' },
  { id: 'pesticides' }
];

const MARKET_I18N = {
  en: {
    title: "Farmer Marketplace", browseItems: "Browse Items", sellItem: "Sell Item", dashboard: "Dashboard",
    loginRegister: "Login / Register", loginTitle: "Login to Marketplace", registerTitle: "Create Farmer Account",
    fullName: "Full Name", location: "Village / City Location", mobileNumber: "Mobile Number", password: "Password",
    loginBtn: "Login", signupBtn: "Sign Up", wait: "Please wait...", noAccount: "Don't have an account? Register",
    hasAccount: "Already have an account? Login", searchPlaceholder: "Search tools, seeds, fertilizers...",
    cat_all: "All Categories", cat_tools: "Tools", cat_machines: "Machines", cat_seeds: "Seeds",
    cat_fertilizers: "Fertilizers", cat_pesticides: "Pesticides", newest: "Newest First", priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low", loading: "Loading products...", noProducts: "No products found matching your criteria.",
    welcome: "Welcome", verifiedFarmer: "Verified Farmer ✓", farmer: "Farmer", yourListings: "Your Listings",
    noListings: "You haven't listed any items yet.", soldMark: "SOLD", markSold: "Mark Sold", markAvailable: "Mark Available",
    listNewItem: "List New Item", productName: "Product Name", categoryLabel: "Category", priceLabel: "Price (₹)",
    descriptionLabel: "Product Description", descriptionPlaceholder: "Detail condition, features, age...",
    sellerLocation: "Seller Location", contactNumber: "Contact Number", uploadImages: "Upload Images (Max 3)",
    uploadClick: "Click to select images", postListing: "Post Listing", posting: "Posting...", backToBrowse: "← Back to Browse",
    descTitle: "Description", sellerDetails: "Seller Details", verifiedSeller: "Verified Seller", callSeller: "Call Seller",
    whatsapp: "WhatsApp", errDelete: "Error deleting product", errStatus: "Error updating status", errList: "Error listing product",
    confirmDelete: "Delete this listing?", successList: "Product listed successfully!",
    prod_UsedTractor2018: "Used Tractor (2018)", prod_PremiumWheatSeeds: "Premium Wheat Seeds", prod_WaterPump2HP: "Water Pump 2HP",
    loc_Punjab: "Ludhiana, Punjab", loc_Haryana: "Karnal, Haryana"
  },
  hi: {
    title: "किसान बाज़ार", browseItems: "सामग्री देखें", sellItem: "सामग्री बेचें", dashboard: "डैशबोर्ड",
    loginRegister: "लॉगिन / पंजीकरण", loginTitle: "बाज़ार में लॉगिन करें", registerTitle: "किसान खाता बनाएँ",
    fullName: "पूरा नाम", location: "गांव / शहर का स्थान", mobileNumber: "मोबाइल नंबर", password: "पासवर्ड",
    loginBtn: "लॉगिन", signupBtn: "पंजीकरण", wait: "कृपया प्रतीक्षा करें...", noAccount: "खाता नहीं है? पंजीकरण करें",
    hasAccount: "पहले से खाता है? लॉगिन करें", searchPlaceholder: "उपकरण, बीज, उर्वरक खोजें...",
    cat_all: "सभी श्रेणियां", cat_tools: "उपकरण", cat_machines: "मशीनें", cat_seeds: "बीज",
    cat_fertilizers: "उर्वरक", cat_pesticides: "कीटनाशक", newest: "सबसे नया पहले", priceAsc: "मूल्य: कम से अधिक",
    priceDesc: "मूल्य: अधिक से कम", loading: "उत्पाद लोड हो रहे हैं...", noProducts: "आपके मापदंड से मेल खाने वाला कोई उत्पाद नहीं मिला।",
    welcome: "स्वागत है", verifiedFarmer: "सत्यापित किसान ✓", farmer: "किसान", yourListings: "आपकी लिस्टिंग",
    noListings: "आपने अभी तक कोई सामग्री सूचीबद्ध नहीं की है।", soldMark: "बिक गया", markSold: "बिक गया चुनें", markAvailable: "उपलब्ध चुनें",
    listNewItem: "नई सामग्री सूचीबद्ध करें", productName: "उत्पाद का नाम", categoryLabel: "श्रेणी", priceLabel: "मूल्य (₹)",
    descriptionLabel: "उत्पाद विवरण", descriptionPlaceholder: "विस्तृत स्थिति, विशेषताएं, उम्र...",
    sellerLocation: "विक्रेता का स्थान", contactNumber: "संपर्क नंबर", uploadImages: "चित्र अपलोड करें (अधिकतम 3)",
    uploadClick: "चित्र चुनने के लिए क्लिक करें", postListing: "लिस्टिंग पोस्ट करें", posting: "पोस्ट किया जा रहा है...", backToBrowse: "← ब्राउज़ पर वापस जाएं",
    descTitle: "विवरण", sellerDetails: "विक्रेता का विवरण", verifiedSeller: "सत्यापित विक्रेता", callSeller: "विक्रेता को कॉल करें",
    whatsapp: "WhatsApp", errDelete: "उत्पाद हटाने में त्रुटि", errStatus: "स्थिति अपडेट करने में त्रुटि", errList: "उत्पाद सूचीबद्ध करने में त्रुटि",
    confirmDelete: "क्या आप इस सामग्री को हटाना चाहते हैं?", successList: "उत्पाद सफलतापूर्वक सूचीबद्ध किया गया!",
    prod_UsedTractor2018: "पुराना ट्रैक्टर (2018)", prod_PremiumWheatSeeds: "प्रीमियम गेहूं के बीज", prod_WaterPump2HP: "वाटर पंप 2 एचपी",
    loc_Punjab: "लुधियाना, पंजाब", loc_Haryana: "करनाल, हरयाणा"
  },
  pa: {
    title: "ਕਿਸਾਨ ਬਾਜ਼ਾਰ", browseItems: "ਸਮਾਨ ਦੇਖੋ", sellItem: "ਸਮਾਨ ਵੇਚੋ", dashboard: "ਡੈਸ਼ਬੋਰਡ",
    loginRegister: "ਲਾਗਇਨ / ਰਜਿਸਟਰ", loginTitle: "ਬਾਜ਼ਾਰ ਵਿੱਚ ਲਾਗਇਨ ਕਰੋ", registerTitle: "ਕਿਸਾਨ ਖਾਤਾ ਬਣਾਓ",
    fullName: "ਪੂਰਾ ਨਾਂ", location: "ਪਿੰਡ / ਸ਼ਹਿਰ", mobileNumber: "ਮੋਬਾਇਲ ਨੰਬਰ", password: "ਪਾਸਵਰਡ",
    loginBtn: "ਲਾਗਇਨ", signupBtn: "ਰਜਿਸਟਰ", wait: "ਕਿਰਪਾ ਉਡੀਕ ਕਰੋ...", noAccount: "ਖਾਤਾ ਨਹੀਂ? ਰਜਿਸਟਰ ਕਰੋ",
    hasAccount: "ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ? ਲਾਗਇਨ ਕਰੋ", searchPlaceholder: "ਔਜ਼ਾਰ, ਬੀਜ, ਖਾਦ ਲੱਭੋ...",
    cat_all: "ਸਾਰੀਆਂ", cat_tools: "ਔਜ਼ਾਰ", cat_machines: "ਮਸ਼ੀਨਾਂ", cat_seeds: "ਬੀਜ",
    cat_fertilizers: "ਖਾਦ", cat_pesticides: "ਕੀਟਨਾਸ਼ਕ", newest: "ਸਭ ਤੋਂ ਨਵਾਂ", priceAsc: "ਮੁੱਲ: ਘੱਟ ਤੋਂ ਵੱਧ",
    priceDesc: "ਮੁੱਲ: ਵੱਧ ਤੋਂ ਘੱਟ", loading: "ਉਤਪਾਦ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...", noProducts: "ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ.",
    welcome: "ਸੁਆਗਤ ਹੈ", verifiedFarmer: "ਸ਼ਾਮਲ ਕਿਸਾਨ ✓", farmer: "ਕਿਸਾਨ", yourListings: "ਤੁਹਾਡੋ ਸਮਾਨ",
    noListings: "ਤੁਸੀਂ ਹਜੇ ਕੋਈ ਸਮਾਨ ਨਹੀਂ ਵੇਚਿਆ.", soldMark: "ਵਿਕ ਗਿਆ", markSold: "ਵਿਕਿਆ ਚੁਣੋ", markAvailable: "ਉਪਲਬਧ ਚੁਣੋ",
    listNewItem: "ਨਵਾਂ ਸਮਾਨ ਵੇਚੋ", productName: "ਉਤਪਾਦ ਦਾ ਨਾਂ", categoryLabel: "ਸ਼੍ਰੇਣੀ", priceLabel: "ਮੁੱਲ (₹)",
    descriptionLabel: "ਵੇਰਵਾ", descriptionPlaceholder: "... ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
    sellerLocation: "ਵਿਕ੍ਰੇਤਾ ਦਾ ਸਥਾਨ", contactNumber: "ਸੰਪਰਕ ਨੰਬਰ", uploadImages: "ਤਸਵੀਰਾਂ ਅਪਲੋਡ ਕਰੋ (3)",
    uploadClick: "ਚੁਣਨ ਲਈ ਕਲਿੱਕ ਕਰੋ", postListing: "ਪੋਸਟ ਕਰੋ", posting: "ਪੋਸਟ ਹੋ ਰਹਾ ਹੈ...", backToBrowse: "← ਵਾਪਸ",
    descTitle: "ਵੇਰਵਾ", sellerDetails: "ਵਿਕ੍ਰੇਤਾ ਦਾ ਵੇਰਵਾ", verifiedSeller: "ਸ਼ਾਮਲ ਵਿਕ੍ਰੇਤਾ", callSeller: "ਕਾਲ ਕਰੋ",
    whatsapp: "WhatsApp", errDelete: "ਹਟਾਊਣ ਵਿੱਚ ਗਲਤੀ", errStatus: "ਅੱਪਡੇਟ ਵਿੱਚ ਗਲਤੀ", errList: "ਉਤਪਾਦ ਵੇਚਣ ਵਿੱਚ ਗਲਤੀ",
    confirmDelete: "ਕੀ ਤੁਸੀਂ ਇਸ ਨੂੰ ਹਟਾਊਣਾ ਚਾਹੁੰਦੇ ਹੋ?", successList: "ਉਤਪਾਦ ਸਫਲਤਾਪੂਰਵਕ ਸੂਚੀਬੱਧ!",
    prod_UsedTractor2018: "ਪੁਰਾਣਾ ਟਰੈਕਟਰ (2018)", prod_PremiumWheatSeeds: "ਚੰਗੇ ਕਣਕ ਦੇ ਬੀਜ", prod_WaterPump2HP: "ਵਾਟਰ ਪੰਪ 2HP",
    loc_Punjab: "ਲੁਧਿਆਣਾ, ਪੰਜਾਬ", loc_Haryana: "ਕਰਨਾਲ, ਹਰਿਆਣਾ"
  }
};

export default function Marketplace({ language = 'en' }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ks_user') || 'null'));
  const [view, setView] = useState('browse'); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const t = MARKET_I18N[language] || MARKET_I18N.en;

  const getTranslated = (product, field) => {
    try {
      if(!product) return "";
      if(product.translations && product.translations[language] && product.translations[language][field]){
        return product.translations[language][field];
      }
      if(field === 'name' && product.name){
         const key = `prod_${product.name.replace(/\s+/g, "").replace(/\(/g, "").replace(/\)/g, "")}`;
         return (t && t[key]) ? t[key] : product.name;
      }
      if(field === 'location' && product.location && product.location.includes(', ')){
         const city = product.location.split(', ')[1];
         return (t && t[`loc_${city}`]) ? t[`loc_${city}`] : product.location;
      }
      return product[field] || "";
    } catch (e) {
      return product ? product[field] : "";
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/products?sort=${sort}`;
      if (category !== 'all') url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      if (view === 'dashboard' && user) url += `&user_id=${user.id}`;
      const res = await axios.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'browse' || view === 'dashboard') {
      fetchProducts();
    }
  }, [view, category, search, sort]);

  const handleLogout = () => {
    localStorage.removeItem('ks_user');
    setUser(null);
    setView('browse');
  };

  return (
    <div className="marketplace-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Store color="var(--primary-color)" /> {t.title}
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {view !== 'browse' && (
             <button className="button secondary" onClick={() => setView('browse')}>{t.browseItems}</button>
          )}
          {user ? (
            <>
              {view !== 'create' && <button className="button" onClick={() => setView('create')}><Plus size={18}/> {t.sellItem}</button>}
              {view !== 'dashboard' && <button className="button secondary" onClick={() => setView('dashboard')}><User size={18}/> {t.dashboard}</button>}
              <button className="button secondary" onClick={handleLogout}><LogOut size={18}/></button>
            </>
          ) : (
            <button className="button" onClick={() => setView('login')}>{t.loginRegister}</button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {view === 'login' && <AuthForm isLogin={true} t={t} onSuccess={(u)=>{setUser(u);localStorage.setItem('ks_user',JSON.stringify(u));setView('browse');}} onSwitch={()=>setView('register')} />}
          {view === 'register' && <AuthForm isLogin={false} t={t} onSuccess={(u)=>{setUser(u);localStorage.setItem('ks_user',JSON.stringify(u));setView('browse');}} onSwitch={()=>setView('login')} />}
          {view === 'browse' && <BrowseView products={products} loading={loading} search={search} setSearch={setSearch} category={category} setCategory={setCategory} sort={sort} setSort={setSort} t={t} getTranslated={getTranslated} onSelect={(p) => { setSelectedProduct(p); setView('product'); }} />}
          {view === 'dashboard' && <DashboardView products={products} loading={loading} user={user} t={t} onRefresh={fetchProducts} getTranslated={getTranslated} />}
          {view === 'create' && <CreateListing user={user} t={t} onDone={() => { setView('dashboard'); }} />}
          {view === 'product' && selectedProduct && <ProductDetail product={selectedProduct} t={t} onBack={() => setView('browse')} getTranslated={getTranslated} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AuthForm({ isLogin, onSuccess, onSwitch, t }) {
  const [formData, setFormData] = useState({ phone: '', password: '', name: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_BASE}${endpoint}`, formData);
      onSuccess(res.data);
    } catch (err) { setError(err.response?.data?.detail || "Error"); }
    setLoading(false);
  };
  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{isLogin ? t.loginTitle : t.registerTitle}</h3>
      {error && <div style={{ background: '#ffebee', padding: '1rem', color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLogin && <><input required placeholder={t.fullName} className="market-input" onChange={e => setFormData({...formData, name: e.target.value})} /><input required placeholder={t.location} className="market-input" onChange={e => setFormData({...formData, location: e.target.value})} /></>}
        <input required placeholder={t.mobileNumber} className="market-input" onChange={e => setFormData({...formData, phone: e.target.value})} />
        <input required type="password" placeholder={t.password} className="market-input" onChange={e => setFormData({...formData, password: e.target.value})} />
        <button type="submit" className="button" disabled={loading}>{loading ? t.wait : (isLogin ? t.loginBtn : t.signupBtn)}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer' }} onClick={onSwitch}>{isLogin ? t.noAccount : t.hasAccount}</p>
    </div>
  );
}

function BrowseView({ products, loading, search, setSearch, category, setCategory, sort, setSort, onSelect, t, getTranslated }) {
  return (
    <div>
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input placeholder={t.searchPlaceholder} className="market-input" style={{flex:1}} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="market-input" value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{t[`cat_${c.id}`]}</option>)}</select>
        <select className="market-input" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">{t.newest}</option><option value="price_asc">{t.priceAsc}</option><option value="price_desc">{t.priceDesc}</option></select>
      </div>
      {loading ? <p>{t.loading}</p> : <div className="grid">{products.map(p => <ProductCard key={p.id} product={p} onClick={() => onSelect(p)} t={t} getTranslated={getTranslated} />)}</div>}
    </div>
  );
}

function ProductCard({ product, onClick, t, getTranslated }) {
  const imageUrl = product.images && product.images.length > 0 ? `${API_BASE.replace('/api/marketplace', '').replace('localhost', '127.0.0.1')}/static/uploads/${product.images[0]}` : 'https://via.placeholder.com/300?text=No+Image';
  return (
    <div className="card price-card" onClick={onClick} style={{ cursor: 'pointer', padding: 0 }}>
       <img src={imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
       <div style={{ padding: '1rem' }}>
          <h3>{getTranslated(product, 'name')}</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>₹{product.price}</p>
          <p><MapPin size={14}/> {getTranslated(product, 'location')}</p>
       </div>
    </div>
  );
}

function DashboardView({ products, loading, user, onRefresh, t, getTranslated }) {
  const handleStatus = async (id, status) => { const fd = new FormData(); fd.append('status', status); await axios.put(`${API_BASE}/products/${id}/status`, fd); onRefresh(); };
  const handleDelete = async (id) => { if(window.confirm(t.confirmDelete)) { await axios.delete(`${API_BASE}/products/${id}`); onRefresh(); } };
  return (
    <div>
      <div className="card" style={{marginBottom:'1rem'}}><h3>{t.welcome}, {user.name}</h3></div>
      <div className="grid">
        {products.map(p => (
          <div key={p.id} className="card">
            <h4>{getTranslated(p, 'name')}</h4>
            <p>₹{p.price}</p>
            <div style={{display:'flex',gap:'5px'}}>
              <button className="button secondary" onClick={() => handleStatus(p.id, p.status==='available' ? 'sold':'available')}>{p.status==='available'?t.markSold:t.markAvailable}</button>
              <button className="button secondary" onClick={() => handleDelete(p.id)}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateListing({ user, onDone, t }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'tools', price: '', description: '', location: user.location || '', contact_number: user.phone || '' });
  const [files, setFiles] = useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData();
    Object.keys(formData).forEach(k => fd.append(k, formData[k]));
    fd.append('user_id', user.id);
    files.forEach(f => fd.append('images', f));
    try { await axios.post(`${API_BASE}/products`, fd); onDone(); } catch(e) { alert("Error"); }
    setLoading(false);
  };
  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h3>{t.listNewItem}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input required placeholder={t.productName} className="market-input" onChange={e => setFormData({...formData, name: e.target.value})} />
        <select className="market-input" onChange={e => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{t[`cat_${c.id}`]}</option>)}</select>
        <input required type="number" placeholder={t.priceLabel} className="market-input" onChange={e => setFormData({...formData, price: e.target.value})} />
        <textarea required placeholder={t.descriptionLabel} className="market-input" rows="3" onChange={e => setFormData({...formData, description: e.target.value})} />
        <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} />
        <button type="submit" className="button" disabled={loading}>{loading ? t.posting : t.postListing}</button>
      </form>
    </div>
  );
}

function ProductDetail({ product, onBack, t, getTranslated }) {
  return (
    <div className="card" style={{ padding: '2rem' }}>
      <button className="button secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>{t.backToBrowse}</button>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <img src={product.images && product.images.length > 0 ? `${API_BASE.replace('/api/marketplace', '').replace('localhost', '127.0.0.1')}/static/uploads/${product.images[0]}` : ''} style={{ width: '400px', height: '400px', objectFit: 'cover', borderRadius: '12px' }} />
        <div style={{flex:1}}>
          <h2>{getTranslated(product, 'name')}</h2>
          <p style={{fontSize:'2rem',fontWeight:'bold',color:'green'}}>₹{product.price}</p>
          <div style={{background:'#f9f9f9',padding:'1rem',borderRadius:'8px',marginBottom:'1rem'}}>
            <h4>{t.descTitle}</h4>
            <p>{getTranslated(product, 'description')}</p>
          </div>
          <p><MapPin size={18}/> {getTranslated(product, 'location')}</p>
          <div style={{display:'flex',gap:'1rem',marginTop:'2rem'}}>
            <a href={`tel:${product.contact_number}`} className="button" style={{flex:1,textAlign:'center'}}>{t.callSeller}</a>
            <a href={`https://wa.me/91${product.contact_number}`} target="_blank" className="button" style={{flex:1,textAlign:'center',background:'#25D366'}}>{t.whatsapp}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const MessageCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);
