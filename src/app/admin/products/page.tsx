'use client';

import { useState, useEffect } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';

// ── Category tree flattener ────────────────────────────────────────────────
interface NestedCategory {
  id: string;
  slug: string;
  name: string;
  children?: NestedCategory[];
}

interface FlatCategory {
  id: string;
  slug: string;
  label: string; // Full path: "Polycab > Fans > Ceiling Fans"
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
  const isReadOnly = user?.role === 'VIEWER';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Form state
  const [form, setForm] = useState({ slug: '', title: '', description: '', features: '', imageSrc: '', categoryId: '', newCategoryName: '', datasheetLink: '', isActive: true, sortOrder: 0, stock: 0 });

  const fetchProducts = async () => {
    setLoading(true);
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
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditProduct(null);
    setForm({ slug: '', title: '', description: '', features: '', imageSrc: '', categoryId: '', newCategoryName: '', datasheetLink: '', isActive: true, sortOrder: 0, stock: 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
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
    
    let finalCategoryId = form.categoryId;
    
    // Auto-create category if user typed a new one
    if (form.categoryId === 'new' && form.newCategoryName) {
      showToast('Creating new category...', 'info');
      const catRes = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: form.newCategoryName, 
          slug: form.newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
        }),
      });
      const catData = await catRes.json();
      if (catData.success) {
        finalCategoryId = catData.data.id;
        // Refresh categories list in background
        fetch('/api/admin/categories').then(r => r.json()).then(d => { if (d.success) setCategories(flattenCategories(d.data)); });
      } else {
        showToast(catData.message || 'Failed to create category', 'error');
        return; // Stop product creation if category creation fails
      }
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
            {!isReadOnly && (
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
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No products found.</td></tr>
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
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Title *</label>
                  <input className="admin-form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category *</label>
                  <select className="admin-form-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="">-- Select Category --</option>
                    <option value="new" style={{ fontWeight: 'bold', color: '#1E2E5E' }}>+ Type New Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {'  '.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.label}
                      </option>
                    ))}
                  </select>
                  {form.categoryId === 'new' && (
                    <input 
                      type="text" 
                      className="admin-form-input mt-2" 
                      placeholder="Enter new category name..." 
                      value={form.newCategoryName}
                      onChange={(e) => setForm({ ...form, newCategoryName: e.target.value })}
                      required
                      autoFocus
                    />
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Slug *</label>
                  <input className="admin-form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. polycab-lv-cable" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Image URL</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input className="admin-form-input" value={form.imageSrc} onChange={(e) => setForm({ ...form, imageSrc: e.target.value })} placeholder="URL or Choose File ->" style={{ flex: 1 }} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  {form.imageSrc && <img src={form.imageSrc} alt="Preview" style={{ marginTop: '10px', height: '100px', borderRadius: '4px' }} />}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Features (Bullet Points)</label>
                  <textarea className="admin-form-textarea" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Enter features separated by newlines..." />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Datasheet Link</label>
                  <input className="admin-form-input" type="text" value={form.datasheetLink} onChange={(e) => setForm({ ...form, datasheetLink: e.target.value })} placeholder="e.g. /assets/pdf/datasheet.pdf" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Stock</label>
                    <input className="admin-form-input" type="number" value={form.stock === 0 ? '' : form.stock} placeholder="0" onChange={(e) => setForm({ ...form, stock: e.target.value === '' ? 0 : parseInt(e.target.value) })} />
                  </div>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Sort Order</label>
                    <input className="admin-form-input" type="number" value={form.sortOrder === 0 ? '' : form.sortOrder} placeholder="0" onChange={(e) => setForm({ ...form, sortOrder: e.target.value === '' ? 0 : parseInt(e.target.value) })} />
                  </div>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Active</label>
                    <select className="admin-form-select" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
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
    </AdminShell>
  );
}
