'use client';

import { useState, useEffect } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { useAdminCache, getCached } from '../components/AdminCacheProvider';
import SkeletonTable from '../components/SkeletonTable';

// ── Types ──────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children: Category[];
  _count: { products: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Flattens the nested category tree into a flat list with full path label.
 * e.g. { id, slug, label: "Polycab > Fans > Ceiling Fans", depth }
 */
function flattenTree(
  cats: Category[],
  parent: { slug: string; label: string } | null = null,
  depth = 0
): { id: string; slug: string; label: string; depth: number }[] {
  const result: { id: string; slug: string; label: string; depth: number }[] = [];
  for (const cat of cats) {
    const label = parent ? `${parent.label} > ${cat.name}` : cat.name;
    result.push({ id: cat.id, slug: cat.slug, label, depth });
    if (cat.children?.length) {
      result.push(...flattenTree(cat.children, { slug: cat.slug, label }, depth + 1));
    }
  }
  return result;
}

/**
 * Collects the IDs of a category and all its descendants.
 * Used to exclude self+descendants from the parent dropdown.
 */
function collectDescendantIds(cat: Category): Set<string> {
  const ids = new Set<string>([cat.id]);
  for (const child of cat.children ?? []) {
    collectDescendantIds(child).forEach(id => ids.add(id));
  }
  return ids;
}

/**
 * Finds a category by ID anywhere in the nested tree.
 */
function findById(cats: Category[], id: string): Category | null {
  for (const c of cats) {
    if (c.id === id) return c;
    const found = findById(c.children ?? [], id);
    if (found) return found;
  }
  return null;
}

// ── Recursive table rows ──────────────────────────────────────────────────

interface RowProps {
  cat: Category;
  depth: number;
  isReadOnly: boolean;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

function CategoryRow({ cat, depth, isReadOnly, onEdit, onDelete }: RowProps) {
  const indent = depth * 24;
  const prefix = depth === 0 ? '📁' : depth === 1 ? '└─' : '  └─';

  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${12 + indent}px`, fontWeight: depth === 0 ? 700 : 400, color: depth === 0 ? '#1a202c' : '#4a5568' }}>
          {cat.image && (
            <img src={cat.image} alt="" style={{ width: depth === 0 ? 28 : 22, height: depth === 0 ? 28 : 22, borderRadius: 4, objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }} />
          )}
          {prefix} {cat.name}
        </td>
        <td>
          <span style={{ fontSize: '12px', color: '#718096' }}>{cat.slug}</span>
          <a href={`/${cat.slug}`} target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 11, color: '#f7931e', textDecoration: 'none', fontWeight: 600 }}>
            ↗ View
          </a>
        </td>
        <td>{cat._count?.products ?? 0}</td>
        <td>{cat.children?.length ?? 0}</td>
        <td>
          <span className={`admin-badge ${cat.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
            {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </td>
        <td>
          <div className="admin-table-actions">
            {isReadOnly ? (
              <span style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>Read Only</span>
            ) : (
              <>
                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => onEdit(cat)}>Edit</button>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => onDelete(cat.id)}>Delete</button>
              </>
            )}
          </div>
        </td>
      </tr>
      {(cat.children ?? []).map(child => (
        <CategoryRow
          key={child.id}
          cat={child}
          depth={depth + 1}
          isReadOnly={isReadOnly}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

// ── Page component ─────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  return (
    <AdminShell pageTitle="Categories">
      <AdminCategoriesPageInner />
    </AdminShell>
  );
}

function AdminCategoriesPageInner() {
  const { user } = useAdmin();
  const { fetchWithCache, invalidate } = useAdminCache();
  const cached = getCached('/api/admin/categories');
  const isReadOnly = user?.role === 'VIEWER';

  const [categories, setCategories] = useState<Category[]>(cached?.success ? cached.data : []);
  const [loading, setLoading] = useState(!cached?.success);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    image: '',
    parentId: '',
    newParentName: '',
    sortOrder: 0,
    isActive: true,
  });

  const [flatCats, setFlatCats] = useState<{ id: string; slug: string; label: string; depth: number }[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/categories');
      if (data.success) {
        setCategories(data.data);
        setFlatCats(flattenTree(data.data));
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Top-level categories (for table root rows)
  const topLevel = categories.filter(c => !c.parentId);

  // ── Slug auto-generation ────────────────────────────────────────────────
  // Build the parent slug prefix from the selected parentId, then append
  // the slugified name so the final slug mirrors the URL hierarchy.
  const buildAutoSlug = (name: string, parentId: string): string => {
    const slug = slugify(name);
    if (!parentId || parentId === '' || parentId === 'new') return slug;
    const parentCat = flatCats.find(c => c.id === parentId);
    return parentCat ? `${parentCat.slug}/${slug}` : slug;
  };

  const handleNameChange = (name: string) => {
    if (editCat) {
      // When editing, only update name — slug is already set and user may have customised it
      setForm(f => ({ ...f, name }));
    } else {
      setForm(f => ({ ...f, name, slug: buildAutoSlug(name, f.parentId) }));
    }
  };

  // ── Image upload ────────────────────────────────────────────────────────
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
    const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      setForm(f => ({ ...f, image: data.url }));
      showToast('Image uploaded!', 'success');
    } else {
      showToast(data.message || 'Upload failed', 'error');
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      image: form.image || null,
      parentId: form.parentId === '' ? null : form.parentId,
      isActive: form.isActive,
    };

    const method = editCat ? 'PUT' : 'POST';
    const url = editCat ? `/api/admin/categories/${editCat.id}` : '/api/admin/categories';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      invalidate('/api/admin/categories');
      showToast(editCat ? 'Category updated!' : 'Category created!', 'success');
      setShowModal(false);
      fetchCategories();
    } else {
      showToast(data.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products will be unlinked and child categories will be detached.')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { invalidate('/api/admin/categories'); showToast('Category deleted.', 'success'); fetchCategories(); }
    else showToast(data.message || 'Error', 'error');
  };

  const openCreate = () => {
    setEditCat(null);
    setForm({ slug: '', name: '', description: '', image: '', parentId: '', newParentName: '', sortOrder: 0, isActive: true });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    
    setForm({
      slug: cat.slug,
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      parentId: cat.parentId || '',
      newParentName: '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setShowModal(true);
  };

  // Build the set of IDs to exclude from the parent dropdown when editing
  // (cannot select self or any of self's descendants as parent → prevents cycles)
  const excludedIds: Set<string> = editCat
    ? collectDescendantIds(findById(categories, editCat.id) ?? editCat)
    : new Set();

  const parentOptions = flatCats.filter(c => !excludedIds.has(c.id));

  return (
    <>
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Product Categories ({flatCats.length})</h3>
          {!isReadOnly && (
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Category</button>
          )}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug / URL</th>
              <th>Products</th>
              <th>Sub-cats</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 0 }}><SkeletonTable rows={6} cols={5} /></td></tr>
            ) : topLevel.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No categories yet. Click "+ Add Category" to create one.</td></tr>
            ) : (
              topLevel.map(cat => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  depth={0}
                  isReadOnly={isReadOnly}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editCat ? 'Edit Category' : 'Add Category'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">

                {/* Name */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Name *</label>
                  <input
                    className="admin-form-input"
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                {/* Slug */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Slug *{' '}
                    <span style={{ fontWeight: 400, color: '#a0aec0', fontSize: 12 }}>
                      (URL: mohit.bdm.co.in/<strong>{form.slug || '…'}</strong>)
                    </span>
                  </label>
                  <input
                    className="admin-form-input"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    required
                  />
                </div>

                {/* Parent Category Dropdown */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Parent Category</label>
                  <select
                    className="admin-form-select"
                    value={form.parentId}
                    onChange={e => {
                      const pId = e.target.value;
                      setForm(f => ({
                        ...f,
                        parentId: pId,
                        slug: editCat ? f.slug : buildAutoSlug(f.name, pId)
                      }));
                    }}
                  >
                    <option value="">None (Top Level)</option>
                    {parentOptions.map(c => (
                      <option key={c.id} value={c.id}>
                        {'\u00A0'.repeat(c.depth * 3)}{c.depth > 0 ? '↳ ' : ''}{c.label.split(' > ').pop()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Category Image</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      className="admin-form-input"
                      value={form.image}
                      onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                      placeholder="Image URL or upload →"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  {form.image && (
                    <img src={form.image} alt="Preview" style={{ marginTop: 10, height: 80, borderRadius: 6, objectFit: 'cover' }} />
                  )}
                </div>

                {/* Description */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    className="admin-form-textarea"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description shown on the category page…"
                  />
                </div>

                {/* Status */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    className="admin-form-select"
                    value={form.isActive ? 'true' : 'false'}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
 
                {/* Sort Order */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Sort Order</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={form.sortOrder === 0 ? '' : form.sortOrder}
                    placeholder="0"
                    onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editCat ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
