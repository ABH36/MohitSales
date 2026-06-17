'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';

interface NestedCategory {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  children?: NestedCategory[];
}

interface FlatCategory {
  id: string;
  slug: string;
  label: string;
  depth: number;
}

function flattenCategories(
  cats: NestedCategory[],
  parentLabel = '',
  depth = 0
): FlatCategory[] {
  const result: FlatCategory[] = [];
  for (const cat of cats) {
    const label = parentLabel ? `${parentLabel} > ${cat.name}` : cat.name;
    result.push({ id: cat.id, slug: cat.slug, label, depth });
    if (cat.children?.length) {
      result.push(...flattenCategories(cat.children, label, depth + 1));
    }
  }
  return result;
}

const FEATURE_TEMPLATES = {
  Cables: [
    'High Conductivity Electrolytic Grade Copper / Aluminium',
    'Flame Retardant (FR) insulation properties',
    'FRLSH (Flame Retardant Low Smoke Low Halogen) insulation',
    'High insulation resistance & dielectric strength',
    'Moisture, oil, and chemical resistant outer sheath',
    'Heat resistant up to 105°C',
    'IS 694 and IS 1554 certified standard construction'
  ],
  Switchgears: [
    'Short circuit breaking capacity of 10kA',
    'IP20 finger-proof terminals protection',
    'Mid-trip indication feature for fault identification',
    'Dual termination facility for busbar & cable connection',
    'Low power watt loss for energy efficiency'
  ],
  Fans: [
    'Double ball bearing for whisper-quiet operation',
    'High air delivery rate (230 CMM)',
    'Anti-rust aluminum body & blades',
    'High speed copper motor',
    'BEE Star rated energy saving motor'
  ],
  'Lugs & Glands': [
    'Corrosion-resistant tin plating finish',
    'IP68 weatherproof and dustproof rated',
    'High tensile strength construction',
    'Accurate dimensional matching for standard conductors',
    'Heavy-duty brass / electrolytic grade copper build'
  ]
};

// ──────────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  features: string | null;
  imageSrc: string | null;
  datasheetLink: string | null;
  isActive: boolean;
  sortOrder: number;
  stock: number;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const { user } = useAdmin();
  // VIEWER role is read-only; ADMIN and EDITOR can create/edit/delete
  const isReadOnly = user?.role === 'VIEWER';
  const canWrite = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [rawCategories, setRawCategories] = useState<NestedCategory[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Cascading dropdown states
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'Cables' | 'Switchgears' | 'Fans' | 'Lugs & Glands'>('Cables');

  // Form state
  const [form, setForm] = useState({ slug: '', title: '', description: '', features: '', imageSrc: '', categoryId: '', newCategoryName: '', datasheetLink: '', isActive: true, sortOrder: 0, stock: 0 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/admin/products?page=${page}&search=${search}&limit=15`),
        fetch(`/api/admin/categories`)
      ]);
      const data = await prodRes.json();
      const catData = await catRes.json();

      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
      if (catData.success) {
        setCategories(flattenCategories(catData.data));
        setRawCategories(catData.data);
      }
    } catch (err) {
      console.error('Failed to fetch products/categories', err);
      showToast('Failed to load data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Debounce search: wait 350ms after last keystroke before fetching
  useEffect(() => {
    const timer = setTimeout(() => { fetchProducts(); }, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [fetchProducts, search]);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to slugify a string
  const slugify = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Helper to find category chain in raw nested categories
  const findCategoryChain = (cats: NestedCategory[], targetId: string): NestedCategory[] | null => {
    for (const cat of cats) {
      if (cat.id === targetId) {
        return [cat];
      }
      if (cat.children?.length) {
        const subChain = findCategoryChain(cat.children, targetId);
        if (subChain) {
          return [cat, ...subChain];
        }
      }
    }
    return null;
  };

  const handleTitleChange = (title: string) => {
    setForm(f => {
      const deepestCatId = selectedSubCategoryId || selectedCategoryId || selectedBrandId;
      const cleanTitle = slugify(title);
      const category = rawCategories.find(c => c.id === deepestCatId);
      const catSlug = category ? category.slug : '';
      return {
        ...f,
        title,
        slug: catSlug ? `${catSlug}/${cleanTitle}` : cleanTitle
      };
    });
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setForm(f => {
      const deepestCatId = brandId;
      const cleanTitle = slugify(f.title);
      const category = rawCategories.find(c => c.id === deepestCatId);
      const catSlug = category ? category.slug : '';
      return {
        ...f,
        categoryId: deepestCatId,
        slug: catSlug ? `${catSlug}/${cleanTitle}` : cleanTitle
      };
    });
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId('');
    setForm(f => {
      const deepestCatId = catId || selectedBrandId;
      const cleanTitle = slugify(f.title);
      const category = rawCategories.find(c => c.id === deepestCatId);
      const catSlug = category ? category.slug : '';
      return {
        ...f,
        categoryId: deepestCatId,
        slug: catSlug ? `${catSlug}/${cleanTitle}` : cleanTitle
      };
    });
  };

  const handleSubCategoryChange = (subId: string) => {
    setSelectedSubCategoryId(subId);
    setForm(f => {
      const deepestCatId = subId || selectedCategoryId || selectedBrandId;
      const cleanTitle = slugify(f.title);
      const category = rawCategories.find(c => c.id === deepestCatId);
      const catSlug = category ? category.slug : '';
      return {
        ...f,
        categoryId: deepestCatId,
        slug: catSlug ? `${catSlug}/${cleanTitle}` : cleanTitle
      };
    });
  };

  const handleOpenCreate = () => {
    setEditProduct(null);
    setSelectedBrandId('');
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setForm({ slug: '', title: '', description: '', features: '', imageSrc: '', categoryId: '', newCategoryName: '', datasheetLink: '', isActive: true, sortOrder: 0, stock: 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    
    let brandId = '';
    let catId = '';
    let subCatId = '';
    
    if (p.category) {
      const chain = findCategoryChain(rawCategories, p.category.id);
      if (chain) {
        if (chain.length === 3) {
          brandId = chain[0].id;
          catId = chain[1].id;
          subCatId = chain[2].id;
        } else if (chain.length === 2) {
          brandId = chain[0].id;
          catId = chain[1].id;
        } else if (chain.length === 1) {
          brandId = chain[0].id;
        }
      }
    }
    
    setSelectedBrandId(brandId);
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(subCatId);
    
    setForm({
      slug: p.slug, title: p.title,
      description: p.description || '',
      features: p.features || '',
      imageSrc: p.imageSrc || '',
      categoryId: p.category?.id || '',
      newCategoryName: '',
      datasheetLink: p.datasheetLink || '',
      isActive: p.isActive,
      sortOrder: p.sortOrder,
      stock: p.stock || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategoryId = selectedSubCategoryId || selectedCategoryId || selectedBrandId;
    if (!finalCategoryId) {
      showToast('Please select at least a Brand.', 'error');
      return;
    }

    const payload = { ...form, categoryId: finalCategoryId };

    const method = editProduct ? 'PUT' : 'POST';
    const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      showToast(editProduct ? 'Product updated!' : 'Product created!', 'success');
      setShowModal(false);
      fetchProducts();
    } else {
      showToast(data.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Product deleted.', 'success');
      fetchProducts();
    } else {
      showToast(data.message || 'Error', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      showToast('File size exceeds 300KB limit.', 'error');
      e.target.value = '';
      return;
    }

    showToast('Uploading image...', 'info');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/media', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      setForm({ ...form, imageSrc: data.url });
      showToast('Image uploaded successfully', 'success');
    } else {
      showToast(data.message || 'Upload failed', 'error');
    }
  };

  // Toggle selection of standard features from templates
  const toggleFeatureTemplate = (feat: string) => {
    const lines = form.features.split('\n').map(l => l.trim()).filter(Boolean);
    const index = lines.indexOf(feat.trim());
    let newLines = [];
    if (index >= 0) {
      newLines = lines.filter((_, i) => i !== index);
    } else {
      newLines = [...lines, feat.trim()];
    }
    setForm(f => ({ ...f, features: newLines.join('\n') }));
  };

  const isFeatureActive = (feat: string) => {
    const lines = form.features.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.includes(feat.trim());
  };

  return (
    <AdminShell pageTitle="Products">
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">All Products ({products.length})</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="admin-search-box">
              <span>🔍</span>
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            {canWrite && (
              <button className="admin-btn admin-btn-primary" onClick={handleOpenCreate}>+ Add Product</button>
            )}
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Slug</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.imageSrc && <img src={p.imageSrc} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                    {p.title}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#718096' }}>{p.slug}</span>
                    <a href={`/${p.slug}`} target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 11, color: '#f7931e', textDecoration: 'none', fontWeight: 600 }} title="View on site">
                      ↗ View
                    </a>
                  </td>
                  <td>{p.category?.name || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: p.stock > 0 ? '#38a169' : '#e53e3e' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${p.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {isReadOnly ? (
                        <span style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>Read Only</span>
                      ) : (
                        <>
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEdit(p)}>Edit</button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`admin-page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '90%' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* SECTION 1: बुनियादी जानकारी (Basic Info) */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">📝</span>
                    <h4>भाग 1: बुनियादी जानकारी (Basic Info)</h4>
                  </div>
                  <div className="form-section-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">उत्पाद का नाम / Title *</label>
                      <input className="admin-form-input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
                      <span className="admin-form-help">यह वेबसाइट पर सबसे ऊपर मुख्य हेडिंग (Heading) के रूप में दिखाई देगा।</span>
                    </div>

                    {/* Cascading Category Dropdowns */}
                    <div className="category-cascade-box">
                      <div className="category-cascade-title">कैटेगरी का रास्ता (Category Path):</div>
                      
                      <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                        <label className="admin-form-label" style={{ fontSize: '12px', color: '#4a5568' }}>ब्रांड / Brand *</label>
                        <select
                          className="admin-form-select"
                          value={selectedBrandId}
                          onChange={(e) => handleBrandChange(e.target.value)}
                          required
                        >
                          <option value="">-- Select Brand --</option>
                          {rawCategories.filter(c => !c.parentId).map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedBrandId && rawCategories.filter(c => c.parentId === selectedBrandId).length > 0 && (
                        <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                          <label className="admin-form-label" style={{ fontSize: '12px', color: '#4a5568' }}>श्रेणी / Category *</label>
                          <select
                            className="admin-form-select"
                            value={selectedCategoryId}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            required
                          >
                            <option value="">-- Select Category --</option>
                            {rawCategories.filter(c => c.parentId === selectedBrandId).map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {selectedCategoryId && rawCategories.filter(c => c.parentId === selectedCategoryId).length > 0 && (
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-form-label" style={{ fontSize: '12px', color: '#4a5568' }}>उप-श्रेणी / Sub-Category</label>
                          <select
                            className="admin-form-select"
                            value={selectedSubCategoryId}
                            onChange={(e) => handleSubCategoryChange(e.target.value)}
                          >
                            <option value="">-- Select Sub-Category (Optional) --</option>
                            {rawCategories.filter(c => c.parentId === selectedCategoryId).map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="admin-form-group" style={{ marginTop: '12px' }}>
                      <label className="admin-form-label">यूआरएल लिंक / Slug *</label>
                      <input className="admin-form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. polycab-lv-cable" />
                      <span className="admin-form-help">यह इस उत्पाद का वेब एड्रेस लिंक निर्धारित करेगा।</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: फोटो और पीडीएफ (Media & Attachments) */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">🖼️</span>
                    <h4>भाग 2: फोटो और पीडीएफ (Media & Attachments)</h4>
                  </div>
                  <div className="form-section-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">उत्पाद की फोटो / Image URL</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input className="admin-form-input" value={form.imageSrc} onChange={(e) => setForm({ ...form, imageSrc: e.target.value })} placeholder="URL or Choose File ->" style={{ flex: 1 }} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>
                      {form.imageSrc && <img src={form.imageSrc} alt="Preview" style={{ marginTop: '10px', height: '100px', borderRadius: '4px', objectFit: 'contain', border: '1px solid #e2e8f0' }} />}
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">डाटाशीट लिंक / Datasheet PDF Link</label>
                      <input className="admin-form-input" type="text" value={form.datasheetLink} onChange={(e) => setForm({ ...form, datasheetLink: e.target.value })} placeholder="e.g. /assets/pdf/datasheet.pdf" />
                      <span className="admin-form-help">उत्पाद के पीडीएफ ब्रोशर या टेक्निकल डाटाशीट का लिंक।</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: उत्पाद का विवरण और विशेषताएं (Description & Features) */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">✍️</span>
                    <h4>भाग 3: उत्पाद का विवरण और विशेषताएं (Description & Features)</h4>
                  </div>
                  <div className="form-section-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">विवरण पैराग्राफ / Description Paragraph</label>
                      <textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: '80px' }} />
                      <span className="admin-form-help">यहाँ उत्पाद के बारे में विस्तृत पैराग्राफ विवरण लिखें जो वेबसाइट पर मुख्य पैराग्राफ (Paragraph) के रूप में दिखेगा।</span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">विशेषताएं / Features (Bullet Points)</label>
                      <textarea className="admin-form-textarea" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Enter features separated by newlines..." style={{ minHeight: '100px' }} />
                      <span className="admin-form-help">यहाँ प्रत्येक मुख्य विशेषता को नई लाइन (Enter दबाकर) पर लिखें। आप नीचे दिए गए टेम्पलेट बटनों का उपयोग करके भी इन्हें जोड़ सकते हैं।</span>
                      
                      {/* Predefined Features Templates Section */}
                      <div className="feature-templates-container">
                        <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Quick Features Templates (Click to Add/Remove):</div>
                        <div className="feature-tabs">
                          {(Object.keys(FEATURE_TEMPLATES) as Array<keyof typeof FEATURE_TEMPLATES>).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              className={`feature-tab-btn ${activeFeatureTab === tab ? 'active' : ''}`}
                              onClick={() => setActiveFeatureTab(tab)}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                        <div className="feature-chips">
                          {FEATURE_TEMPLATES[activeFeatureTab].map((feat, index) => {
                            const isActive = isFeatureActive(feat);
                            return (
                              <button
                                key={index}
                                type="button"
                                className={`feature-chip ${isActive ? 'active' : ''}`}
                                onClick={() => toggleFeatureTemplate(feat)}
                              >
                                {isActive ? '✓ ' : '+ '} {feat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: इन्वेंटरी और सेटिंग्स (Inventory & Settings) */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">⚙️</span>
                    <h4>भाग 4: स्टॉक और सेटिंग्स (Settings)</h4>
                  </div>
                  <div className="form-section-body">
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">स्टॉक / Stock</label>
                        <input className="admin-form-input" type="number" value={form.stock === 0 ? '' : form.stock} placeholder="0" onChange={(e) => setForm({ ...form, stock: e.target.value === '' ? 0 : parseInt(e.target.value) })} />
                      </div>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">क्रम संख्या / Sort Order</label>
                        <input className="admin-form-input" type="number" value={form.sortOrder === 0 ? '' : form.sortOrder} placeholder="0" onChange={(e) => setForm({ ...form, sortOrder: e.target.value === '' ? 0 : parseInt(e.target.value) })} />
                      </div>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">स्थिति / Status</label>
                        <select className="admin-form-select" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic CSS Styles for form layout & features templates */}
      <style dangerouslySetInnerHTML={{ __html: `
        .form-section-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .form-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 2px solid #edf2f7;
          padding-bottom: 8px;
          margin-bottom: 14px;
        }
        .form-section-icon {
          font-size: 18px;
        }
        .form-section-header h4 {
          font-size: 13px;
          font-weight: 700;
          color: #1e2e5e;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-section-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .category-cascade-box {
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 12px;
        }
        .category-cascade-title {
          font-size: 11px;
          font-weight: 700;
          color: #718096;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        .admin-form-help {
          display: block;
          font-size: 11px;
          color: #718096;
          margin-top: 4px;
        }
        .feature-templates-container {
          margin-top: 10px;
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 12px;
        }
        .feature-tabs {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid #edf2f7;
          padding-bottom: 6px;
          margin-bottom: 10px;
          overflow-x: auto;
        }
        .feature-tab-btn {
          background: none;
          border: none;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #718096;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .feature-tab-btn.active {
          background: #edf2f7;
          color: #1e2e5e;
        }
        .feature-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-height: 120px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .feature-chip {
          background: #fff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s;
          text-align: left;
        }
        .feature-chip:hover {
          border-color: #f7931e;
          background: #fffaf0;
        }
        .feature-chip.active {
          background: #f7931e;
          border-color: #f7931e;
          color: #fff;
        }
      `}} />
    </AdminShell>
  );
}
