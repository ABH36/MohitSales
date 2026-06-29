'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { useAdminCache, getCached } from '../components/AdminCacheProvider';
import SkeletonTable from '../components/SkeletonTable';

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
  Solar: [
    'High conversion efficiency solar modules',
    'Anti-reflective and hydrophobic glass surface',
    'IP67/IP68 rated junction box with bypass diodes',
    'Excellent performance under low light environments',
    'Robust anodized aluminum alloy frame',
    'MC4 compatible connectors for easy installation'
  ],
  'Conduit & Accessories': [
    'High impact resistance virgin PVC material',
    'Flame retardant & self-extinguishing properties',
    'Smooth internal surface for easy wire pulling',
    'Corrosion and chemical resistant construction',
    'Compatible with standard PVC fittings & accessories'
  ],
  'Home Appliances': [
    'Energy efficient design with high performance',
    'Ergonomic & modern aesthetic styling',
    'Overheat / overload protection safety features',
    'Durable rust-proof outer body construction',
    'User-friendly control interface'
  ],
  'Cable Terminal': [
    'Pure electrolytic copper grade construction',
    'Corrosion-resistant tin plating finish',
    'Bell mouth entry for easy cable insertion',
    'Uniform barrel thickness for reliable crimping',
    'Serrated barrel inner surface for maximum contact'
  ],
  Glands: [
    'Heavy-duty brass nickel-plated construction',
    'IP68 rated dust and water ingress protection',
    'Double compression sealing design for armored cables',
    'Single compression sealing for unarmored cables',
    'Displacement seal protection design'
  ],
  'Crimping Tools': [
    'Heavy-duty mechanical ratchet design',
    'Ergonomic non-slip handle grips',
    'Hexagonal / dieless crimping profile options',
    'Interchangeable steel jaws/dies',
    'Pressure adjustment knob for precise crimping'
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
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  return (
    <AdminShell pageTitle="Products">
      <AdminProductsPageInner />
    </AdminShell>
  );
}

function AdminProductsPageInner() {
  const { user } = useAdmin();
  const { fetchWithCache, invalidate } = useAdminCache();
  const cachedCats = getCached('/api/admin/categories', 120000);
  // VIEWER role is read-only; ADMIN and EDITOR can create/edit/delete
  const isReadOnly = user?.role === 'VIEWER';
  const canWrite = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<FlatCategory[]>(cachedCats?.success ? flattenCategories(cachedCats.data) : []);
  const [rawCategories, setRawCategories] = useState<NestedCategory[]>(cachedCats?.success ? cachedCats.data : []);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [stockFilter, setStockFilter] = useState('');      // '' | 'outofstock'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');

  const [activeFeatureTab, setActiveFeatureTab] = useState<keyof typeof FEATURE_TEMPLATES>('Cables');
  const [featuresArray, setFeaturesArray] = useState<string[]>([]);

  // Form state
  const [form, setForm] = useState({ 
    slug: '', title: '', description: '', features: '', imageSrc: '', 
    categoryId: '', newCategoryName: '', datasheetLink: '', isActive: true, 
    sortOrder: 0, stock: 0,
    metaTitle: '', metaDescription: '', metaKeywords: ''
  });

  const [pdfFiles, setPdfFiles] = useState<{ id: string; filename: string; url: string }[]>([]);

  const fetchPdfFiles = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const filtered = data.data.filter((m: any) => m.mimeType === 'application/pdf');
        setPdfFiles(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch PDF files', err);
    }
  };

  const [pdfFetched, setPdfFetched] = useState(false);

  const handleDatasheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit.', 'error');
      e.target.value = '';
      return;
    }

    showToast('Uploading datasheet PDF...', 'info');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm(f => ({ ...f, datasheetLink: data.url }));
        showToast('Datasheet uploaded successfully', 'success');
        fetchPdfFiles();
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.error('Upload error', err);
      showToast('Upload failed', 'error');
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const prodUrl = `/api/admin/products?page=${page}&search=${search}&limit=15&status=${statusFilter}&stock=${stockFilter}&categoryId=${selectedCategoryFilter}`;
      const [data, catData] = await Promise.all([
        fetchWithCache(prodUrl, 30000),
        fetchWithCache('/api/admin/categories', 120000),
      ]);

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
  }, [page, search, statusFilter, stockFilter, selectedCategoryFilter]);

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

  // Helper to auto-select feature tab based on category ID
  const autoSetFeatureTab = useCallback((catId: string) => {
    const category = categories.find(c => c.id === catId);
    if (!category) return;
    const catLabel = category.label.toLowerCase();
    
    if (catLabel.includes('cable') && !catLabel.includes('terminal') && !catLabel.includes('lug') && !catLabel.includes('gland')) {
      setActiveFeatureTab('Cables');
    } else if (catLabel.includes('switchgear') || catLabel.includes('mcb')) {
      setActiveFeatureTab('Switchgears');
    } else if (catLabel.includes('fan')) {
      setActiveFeatureTab('Fans');
    } else if (catLabel.includes('solar')) {
      setActiveFeatureTab('Solar');
    } else if (catLabel.includes('conduit') || catLabel.includes('fitting') || catLabel.includes('accessories')) {
      setActiveFeatureTab('Conduit & Accessories');
    } else if (catLabel.includes('appliance')) {
      setActiveFeatureTab('Home Appliances');
    } else if (catLabel.includes('terminal') || catLabel.includes('lug') || catLabel.includes('dowells')) {
      setActiveFeatureTab('Cable Terminal');
    } else if (catLabel.includes('gland')) {
      setActiveFeatureTab('Glands');
    } else if (catLabel.includes('tool') || catLabel.includes('crimping')) {
      setActiveFeatureTab('Crimping Tools');
    }
  }, [categories]);

  const handleTitleChange = (title: string) => {
    setForm(f => {
      const cleanTitle = slugify(title);
      const category = categories.find(c => c.id === f.categoryId);
      const catSlug = category ? category.slug : '';
      return {
        ...f,
        title,
        slug: catSlug ? `${catSlug}/${cleanTitle}` : cleanTitle
      };
    });
  };

  const handleOpenCreate = () => {
    setEditProduct(null);
    setForm({ slug: '', title: '', description: '', features: '', imageSrc: '', categoryId: selectedCategoryFilter, newCategoryName: '', datasheetLink: '', isActive: true, sortOrder: 0, stock: 0, metaTitle: '', metaDescription: '', metaKeywords: '' });
    setFeaturesArray([]);
    if (!pdfFetched) { fetchPdfFiles(); setPdfFetched(true); }
    if (selectedCategoryFilter) {
      autoSetFeatureTab(selectedCategoryFilter);
    }
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    if (!pdfFetched) { fetchPdfFiles(); setPdfFetched(true); }

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
      stock: p.stock || 0,
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
      metaKeywords: p.metaKeywords || ''
    });
    setFeaturesArray(p.features ? p.features.split('\n').map(l => l.trim()).filter(Boolean) : []);
    if (p.category?.id) {
      autoSetFeatureTab(p.category.id);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.categoryId) {
      showToast('Please select a Category.', 'error');
      return;
    }

    const payload = { 
      ...form, 
      features: featuresArray.filter(l => l.trim() !== '').join('\n') 
    };

    const method = editProduct ? 'PUT' : 'POST';
    const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      invalidate('/api/admin/products');
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
      invalidate('/api/admin/products');
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
    const trimmedFeat = feat.trim();
    setFeaturesArray(prev => {
      const cleaned = prev.map(l => l.trim()).filter(Boolean);
      const index = cleaned.indexOf(trimmedFeat);
      if (index >= 0) {
        return prev.filter((_, i) => prev[i].trim() !== trimmedFeat);
      } else {
        return [...prev, trimmedFeat];
      }
    });
  };

  const isFeatureActive = (feat: string) => {
    return featuresArray.some(l => l.trim() === feat.trim());
  };

  const updateFeatureItem = (index: number, val: string) => {
    setFeaturesArray(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const addFeatureItem = () => {
    setFeaturesArray(prev => [...prev, '']);
  };

  const removeFeatureItem = (index: number) => {
    setFeaturesArray(prev => prev.filter((_, i) => i !== index));
  };

  const moveFeatureItem = (index: number, direction: 'up' | 'down') => {
    setFeaturesArray(prev => {
      const next = [...prev];
      if (direction === 'up' && index > 0) {
        const temp = next[index];
        next[index] = next[index - 1];
        next[index - 1] = temp;
      } else if (direction === 'down' && index < next.length - 1) {
        const temp = next[index];
        next[index] = next[index + 1];
        next[index + 1] = temp;
      }
      return next;
    });
  };

  const handleLocalSortOrderChange = (productId: string, val: number) => {
    setProducts(prev =>
      prev.map(prod => (prod.id === productId ? { ...prod, sortOrder: val } : prod))
    );
  };

  const handleQuickPositionChange = async (productId: string, newSortOrder: number) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: newSortOrder }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Position updated successfully', 'success');
      } else {
        showToast(data.message || 'Failed to update position', 'error');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating position', 'error');
      fetchProducts();
    }
  };

  return (
    <>
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-catalog-container">
        {/* Left Sidebar: Categories Navigation */}
        <aside className="admin-category-sidebar">
          <div className="category-sidebar-header">
            <h4>Categories</h4>
          </div>
          <div className="category-sidebar-list">
            <button
              onClick={() => { setSelectedCategoryFilter(''); setPage(1); }}
              className={`category-sidebar-btn ${selectedCategoryFilter === '' ? 'active' : ''}`}
            >
              <span className="bullet">•</span> All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategoryFilter(cat.id); setPage(1); }}
                className={`category-sidebar-btn depth-${cat.depth} ${selectedCategoryFilter === cat.id ? 'active' : ''}`}
                title={cat.label}
              >
                {cat.depth > 0 && <span className="bullet">↳</span>}
                <span className="label-text">{cat.label.split(' > ').pop()}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content Area: Products List */}
        <div className="admin-catalog-content">
          <div className="admin-table-wrapper" style={{ margin: 0 }}>
            <div className="admin-table-header">
              <h3 className="admin-table-title">
                {selectedCategoryFilter 
                  ? `${categories.find(c => c.id === selectedCategoryFilter)?.label.split(' > ').pop()} Products`
                  : 'All Products'
                } ({products.length})
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="admin-search-box">
                  <span>🔍</span>
                  <input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <select
                  className="admin-form-select"
                  style={{ minWidth: 130, fontSize: 13 }}
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                  <option value="all">All Status</option>
                  <option value="active">✅ Active</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
                <select
                  className="admin-form-select"
                  style={{ minWidth: 150, fontSize: 13 }}
                  value={stockFilter}
                  onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All Stock</option>
                  <option value="outofstock">🔴 Out of Stock</option>
                </select>
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
                  <th>Position</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 0 }}><SkeletonTable rows={8} cols={6} /></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No products found.</td></tr>
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
                        <input
                          type="number"
                          className="admin-table-position-input"
                          value={p.sortOrder}
                          onChange={(e) => handleLocalSortOrderChange(p.id, e.target.value === '' ? 0 : parseInt(e.target.value))}
                          onBlur={() => handleQuickPositionChange(p.id, p.sortOrder)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
                          disabled={isReadOnly}
                          style={{
                            width: '65px',
                            padding: '4px 6px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '12px',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#1e2e5e',
                            outline: 'none',
                            background: '#f8fafc',
                          }}
                        />
                      </td>
                      <td>
                        {p.stock > 0 ? (
                          <span style={{ fontWeight: 'bold', color: '#38a169', fontSize: 13 }}>✅ {p.stock}</span>
                        ) : (
                          <span style={{ fontWeight: 'bold', color: '#e53e3e', fontSize: 12, background: '#fff5f5', border: '1px solid #fed7d7', padding: '2px 8px', borderRadius: 12 }}>🔴 Out of Stock</span>
                        )}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', width: '95%' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '72vh', overflowY: 'auto' }}>

                {/* SECTION 1: Basic Information */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">📝</span>
                    <h4>Part 1: Basic Information</h4>
                  </div>
                  <div className="form-section-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Product Title / Name *</label>
                      <input className="admin-form-input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Enter product title..." required />
                      <span className="admin-form-help">This will be displayed as the main heading at the top of the product page.</span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Category *</label>
                      <select
                        className="admin-form-select"
                        value={form.categoryId}
                        onChange={(e) => {
                          const catId = e.target.value;
                          autoSetFeatureTab(catId);
                          setForm(f => {
                            const category = categories.find(c => c.id === catId);
                            const catSlug = category ? category.slug : '';
                            const cleanTitle = slugify(f.title);
                            return {
                              ...f,
                              categoryId: catId,
                              slug: catSlug ? `${catSlug}/${cleanTitle}` : cleanTitle
                            };
                          });
                        }}
                        required
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {'\u00A0'.repeat(c.depth * 3)}{c.depth > 0 ? '↳ ' : ''}{c.label.split(' > ').pop()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group" style={{ marginTop: '12px' }}>
                      <label className="admin-form-label">URL Slug *</label>
                      <input className="admin-form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. polycab-lv-cable" />
                      <span className="admin-form-help">This determines the web address URL path of the product.</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Media & Attachments */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">🖼️</span>
                    <h4>Part 2: Media & Attachments</h4>
                  </div>
                  <div className="form-section-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Product Image URL</label>
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
                      <label className="admin-form-label">Datasheet PDF Link</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            className="admin-form-input" 
                            type="text" 
                            value={form.datasheetLink} 
                            onChange={(e) => setForm({ ...form, datasheetLink: e.target.value })} 
                            placeholder="URL or Choose File ->" 
                            style={{ flex: 1 }} 
                          />
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleDatasheetUpload}
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                        {pdfFiles.length > 0 && (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#718096', whiteSpace: 'nowrap' }}>Select Existing PDF:</span>
                            <select
                              className="admin-form-select"
                              style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                              value={pdfFiles.some(p => p.url === form.datasheetLink) ? form.datasheetLink : ''}
                              onChange={(e) => setForm({ ...form, datasheetLink: e.target.value })}
                            >
                              <option value="">-- Choose from Media Library --</option>
                              {pdfFiles.map((pdf) => (
                                <option key={pdf.id} value={pdf.url}>
                                  {pdf.filename}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <span className="admin-form-help">Link to the product brochure or technical datasheet PDF. You can upload a file here or select a previously uploaded file from the media library.</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Description & Features */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">✍️</span>
                    <h4>Part 3: Description & Features</h4>
                  </div>
                  <div className="form-section-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Description Paragraph</label>
                      <textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter detailed product description..." style={{ minHeight: '80px' }} />
                      <span className="admin-form-help">Enter the detailed product description paragraph. This will be shown as the main body text on the website.</span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Features (Bullet Points)</label>
                      <div className="admin-features-editor">
                        {featuresArray.length === 0 ? (
                          <div className="admin-features-empty">
                            No bullet points added yet. Add a custom point or click quick templates below.
                          </div>
                        ) : (
                          <div className="admin-features-list">
                            {featuresArray.map((feat, idx) => (
                              <div key={idx} className="admin-feature-row">
                                <span className="feature-drag-handle">☰</span>
                                <span className="feature-index">{idx + 1}.</span>
                                <input
                                  type="text"
                                  className="admin-form-input feature-input"
                                  value={feat}
                                  placeholder={`Feature #${idx + 1}...`}
                                  onChange={(e) => updateFeatureItem(idx, e.target.value)}
                                />
                                <div className="feature-row-actions">
                                  <button
                                    type="button"
                                    className="feature-action-btn move-btn"
                                    onClick={() => moveFeatureItem(idx, 'up')}
                                    disabled={idx === 0}
                                    title="Move Up"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    className="feature-action-btn move-btn"
                                    onClick={() => moveFeatureItem(idx, 'down')}
                                    disabled={idx === featuresArray.length - 1}
                                    title="Move Down"
                                  >
                                    ▼
                                  </button>
                                  <button
                                    type="button"
                                    className="feature-action-btn delete-btn"
                                    onClick={() => removeFeatureItem(idx)}
                                    title="Remove Bullet"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          className="admin-btn admin-btn-outline add-feature-btn"
                          onClick={addFeatureItem}
                          style={{ width: '100%', marginTop: '10px', borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <span>+</span> Add Custom Bullet Point
                        </button>
                      </div>
                      <span className="admin-form-help" style={{ marginTop: '6px', display: 'block' }}>
                        Each bullet point is a separate line. Use the arrows to reorder, or choose from the templates below to add them instantly.
                      </span>

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

                {/* SECTION 4: Inventory & Settings */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">⚙️</span>
                    <h4>Part 4: Inventory & Settings</h4>
                  </div>
                  <div className="form-section-body">
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">Stock Quantity</label>
                        <input className="admin-form-input" type="number" value={form.stock === 0 ? '' : form.stock} placeholder="0" onChange={(e) => setForm({ ...form, stock: e.target.value === '' ? 0 : parseInt(e.target.value) })} />
                      </div>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">Sort Order (Priority)</label>
                        <input className="admin-form-input" type="number" value={form.sortOrder === 0 ? '' : form.sortOrder} placeholder="0" onChange={(e) => setForm({ ...form, sortOrder: e.target.value === '' ? 0 : parseInt(e.target.value) })} />
                      </div>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">Status</label>
                        <select className="admin-form-select" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: SEO Meta Tags */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <span className="form-section-icon">🔍</span>
                    <h4>Part 5: SEO Meta Tags (Search Engines)</h4>
                  </div>
                  <div className="form-section-body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Meta Title</label>
                      <input
                        className="admin-form-input"
                        type="text"
                        value={form.metaTitle}
                        maxLength={160}
                        placeholder="e.g. Polycab 3 Core Flat Cables | Premium Quality Wires"
                        onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                      />
                      <span className="admin-form-help">Custom HTML Title tag for browser title bar and search results page. Defaults to product name if blank. ({form.metaTitle.length}/160)</span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Meta Description</label>
                      <textarea
                        className="admin-form-textarea"
                        value={form.metaDescription}
                        maxLength={160}
                        placeholder="e.g. Buy high conductivity electrolytic grade copper Polycab flat cables with high insulation resistance. Authorized distributor..."
                        style={{ minHeight: '60px' }}
                        onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                      />
                      <span className="admin-form-help">Search engine snippet showing in search results page. Summarize the product in 150-160 characters. ({form.metaDescription.length}/160)</span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Meta Keywords</label>
                      <input
                        className="admin-form-input"
                        type="text"
                        value={form.metaKeywords}
                        maxLength={250}
                        placeholder="e.g. polycab flat cables, 3 core wire, submersible pump cable"
                        onChange={(e) => setForm(f => ({ ...f, metaKeywords: e.target.value }))}
                      />
                      <span className="admin-form-help">Comma-separated tags for keywords meta tag (optional).</span>
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
      <style dangerouslySetInnerHTML={{
        __html: `
        .admin-catalog-container {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          width: 100%;
        }
        .admin-category-sidebar {
          width: 260px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          flex-shrink: 0;
          padding: 16px;
        }
        .category-sidebar-header h4 {
          font-size: 13px;
          font-weight: 700;
          color: #1e2e5e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #edf2f7;
          padding-bottom: 10px;
          margin-top: 0;
          margin-bottom: 12px;
        }
        .category-sidebar-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 4px;
        }
        .category-sidebar-btn {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          background: none;
          border: none;
          color: #4a5568;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          gap: 8px;
        }
        .category-sidebar-btn:hover {
          background: #f7fafc;
          color: #1e2e5e;
        }
        .category-sidebar-btn.active {
          background: #edf2f7;
          color: #1e2e5e;
          font-weight: 600;
        }
        .category-sidebar-btn.depth-1 {
          padding-left: 24px;
        }
        .category-sidebar-btn.depth-2 {
          padding-left: 36px;
        }
        .category-sidebar-btn .bullet {
          font-size: 14px;
          color: #a0aec0;
          flex-shrink: 0;
        }
        .category-sidebar-btn.active .bullet {
          color: #f7931e;
        }
        .category-sidebar-btn .label-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-catalog-content {
          flex: 1;
          min-width: 0;
        }
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

        /* Features Editor Styles */
        .admin-features-editor {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 8px;
        }
        .admin-features-empty {
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
          padding: 16px;
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 6px;
        }
        .admin-features-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .admin-feature-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 6px 10px;
          transition: all 0.2s;
        }
        .admin-feature-row:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }
        .feature-drag-handle {
          color: #94a3b8;
          cursor: grab;
          font-size: 14px;
          user-select: none;
        }
        .feature-index {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          min-width: 20px;
        }
        .feature-input {
          flex: 1;
          border: none !important;
          outline: none !important;
          padding: 4px 0 !important;
          font-size: 13px !important;
          background: transparent !important;
          height: auto !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
        .feature-input:focus {
          box-shadow: none !important;
        }
        .feature-row-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .feature-action-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .feature-action-btn:hover:not(:disabled) {
          background: #e2e8f0;
          color: #1e293b;
        }
        .feature-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .feature-action-btn.delete-btn {
          background: #fee2e2;
          color: #ef4444;
          font-size: 11px;
        }
        .feature-action-btn.delete-btn:hover {
          background: #fecaca;
          color: #dc2626;
        }
        .add-feature-btn {
          font-size: 13px !important;
          padding: 8px 16px !important;
          font-weight: 500 !important;
          background: #ffffff !important;
          border: 1px dashed #cbd5e1 !important;
          color: #475569 !important;
          transition: all 0.2s !important;
        }
        .add-feature-btn:hover {
          background: #f8fafc !important;
          border-color: #94a3b8 !important;
          color: #0f172a !important;
        }
      `}} />
    </>
  );
}
