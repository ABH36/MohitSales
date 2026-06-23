'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminShell, { useAdmin } from '../components/AdminShell';

const TipTapEditor = dynamic(() => import('../components/TipTapEditor'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>Loading editor...</div>
});

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  category: { id: string; name: string } | null;
  author: { name: string } | null;
  excerpt?: string | null;
  coverImage?: string | null;
  tags?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  isFeatured?: boolean;
  categoryId?: string | null;
}

export default function AdminBlogsPage() {
  const { user } = useAdmin();
  const isReadOnly = user?.role === 'VIEWER';
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    content: '',
    isPublished: false,
    excerpt: '',
    coverImage: '',
    tags: '',
    metaTitle: '',
    metaDesc: '',
    isFeatured: false,
    categoryId: '',
  });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/blogs/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditBlog(null);
    setForm({
      slug: '',
      title: '',
      content: '',
      isPublished: false,
      excerpt: '',
      coverImage: '',
      tags: '',
      metaTitle: '',
      metaDesc: '',
      isFeatured: false,
      categoryId: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditBlog(blog);
    setForm({
      slug: blog.slug,
      title: blog.title,
      content: blog.content || '',
      isPublished: blog.isPublished,
      excerpt: blog.excerpt || '',
      coverImage: blog.coverImage || '',
      tags: blog.tags || '',
      metaTitle: blog.metaTitle || '',
      metaDesc: blog.metaDesc || '',
      isFeatured: blog.isFeatured || false,
      categoryId: blog.categoryId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      showToast('Title, Slug, and Content are required', 'error');
      return;
    }

    try {
      const url = editBlog ? `/api/admin/blogs/${editBlog.id}` : '/api/admin/blogs';
      const method = editBlog ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (data.success) {
        showToast(`Blog ${editBlog ? 'updated' : 'created'} successfully`, 'success');
        setShowModal(false);
        fetchBlogs();
      } else {
        showToast(data.message || 'Failed to save blog', 'error');
      }
    } catch (error) {
      showToast('Error saving blog', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Blog deleted', 'success');
        fetchBlogs();
      } else {
        showToast('Failed to delete blog', 'error');
      }
    } catch (error) {
      showToast('Error deleting blog', 'error');
    }
  };

  return (
    <AdminShell pageTitle="Blog Posts">
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', background: toast.type === 'error' ? '#f56565' : '#48bb78', color: 'white', borderRadius: '4px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {toast.msg}
        </div>
      )}

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Blog Posts ({blogs.length})</h3>
          {!isReadOnly && (
            <button className="admin-btn admin-btn-primary" onClick={handleOpenCreate}>
              <i className="fa-solid fa-plus"></i> Add Blog Post
            </button>
          )}
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                  <div className="admin-empty">
                    <div className="admin-empty-icon">📝</div>
                    <div className="admin-empty-text">No blog posts yet. Start writing to engage your audience!</div>
                    {!isReadOnly && (
                      <button className="admin-btn admin-btn-outline" onClick={handleOpenCreate} style={{ marginTop: '16px' }}>Create First Post</button>
                    )}
                  </div>
                </td></tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td style={{ fontWeight: 600 }}>{blog.title}</td>
                    <td>{blog.category?.name || '—'}</td>
                    <td>{blog.author?.name || '—'}</td>
                    <td>
                      <span className={`admin-badge ${blog.isPublished ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                        {blog.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </td>
                    <td style={{ color: '#718096', fontSize: '12px' }}>
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        {isReadOnly ? (
                          <span style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>Read Only</span>
                        ) : (
                          <>
                            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEdit(blog)}>Edit</button>
                            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(blog.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Title <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      className="admin-form-input" 
                      type="text" 
                      value={form.title} 
                      onChange={(e) => setForm({ ...form, title: e.target.value, slug: editBlog ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} 
                      required 
                    />
                  </div>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Slug <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      className="admin-form-input" 
                      type="text" 
                      value={form.slug} 
                      onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Category</label>
                    <select
                      className="admin-form-select"
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Cover Image URL</label>
                    <input 
                      className="admin-form-input" 
                      type="text" 
                      value={form.coverImage} 
                      onChange={(e) => setForm({ ...form, coverImage: e.target.value })} 
                      placeholder="/assets/images/blog/..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Tags (comma-separated)</label>
                    <input 
                      className="admin-form-input" 
                      type="text" 
                      value={form.tags} 
                      onChange={(e) => setForm({ ...form, tags: e.target.value })} 
                      placeholder="electrical, wires, polycab"
                    />
                  </div>
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Meta Title (SEO)</label>
                    <input 
                      className="admin-form-input" 
                      type="text" 
                      value={form.metaTitle} 
                      onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Excerpt / Short Summary</label>
                  <textarea 
                    className="admin-form-textarea" 
                    value={form.excerpt} 
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })} 
                    rows={2}
                    placeholder="Short summary for the blog listing page..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Meta Description (SEO)</label>
                  <textarea 
                    className="admin-form-textarea" 
                    value={form.metaDesc} 
                    onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} 
                    rows={2}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Content <span style={{ color: 'red' }}>*</span></label>
                  <TipTapEditor 
                    value={form.content} 
                    onChange={(content) => setForm({ ...form, content })}
                    disabled={isReadOnly}
                  />
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                  <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      id="isPublished" 
                      checked={form.isPublished} 
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} 
                    />
                    <label htmlFor="isPublished" style={{ fontWeight: 500, cursor: 'pointer' }}>Publish immediately</label>
                  </div>

                  <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      id="isFeatured" 
                      checked={form.isFeatured} 
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} 
                    />
                    <label htmlFor="isFeatured" style={{ fontWeight: 500, cursor: 'pointer' }}>Mark as Featured</label>
                  </div>
                </div>

                <div className="admin-form-actions" style={{ marginTop: '24px' }}>
                  <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="admin-btn admin-btn-primary">Save Blog Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
