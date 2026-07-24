'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCaptcha } from '@/components/useCaptcha';

interface EnquiryModalProps {
  productName: string;
  onClose: () => void;
}

export default function EnquiryModal({ productName, onClose }: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    cname: '',
    email: '',
    mobile: '',
    color: '',
    size: '',
    message: `I am interested in ${productName}. Please send me more details and pricing information.`,
    captchaInput: ''
  });

  const { svg: captchaSvg, token: captchaToken, refresh: generateCaptcha } = useCaptcha();
  const [file, setFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Used for exit animation state

  const firstInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsClosing(true);
    // Restore body scroll during close animation
    document.body.style.overflow = '';
    // Wait for fade-out animation before calling onClose
    setTimeout(onClose, 300);
  };

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    // Lock body scroll on mount
    document.body.style.overflow = 'hidden';

    // Focus first input on mount
    firstInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseRef.current();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Restore body scroll on unmount
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, input, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    setIsSubmitting(true);

    try {
      // Colour / size are optional preferences — fold them into the message so
      // they reach sales (DB + email) without needing extra backend columns.
      const prefs = [
        formData.color.trim() && `Preferred Colour: ${formData.color.trim()}`,
        formData.size.trim() && `Preferred Size: ${formData.size.trim()}`,
      ].filter(Boolean);
      const fullMessage = prefs.length
        ? `${formData.message}\n\n${prefs.join('\n')}`
        : formData.message;

      const postData = new FormData();
      postData.append('name', formData.name);
      postData.append('cname', formData.cname);
      postData.append('email', formData.email);
      postData.append('mobile', formData.mobile);
      postData.append('message', fullMessage);
      postData.append('captchaInput', formData.captchaInput);
      postData.append('captchaToken', captchaToken);
      if (file) {
        postData.append('file', file);
      }

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        body: postData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Thank you! Your enquiry has been sent successfully.' });
        
        // Auto-close modal after 2 seconds on success
        setTimeout(handleClose, 2000);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to submit the form. Please try again.' });
        if (data.message && data.message.toLowerCase().includes('captcha')) {
          setFormData(prev => ({ ...prev, captchaInput: '' }));
          generateCaptcha();
        }
      }
    } catch (err) {
      console.error('[EnquiryModal Submit Error]:', err);
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 duration-300 ease-out fill-mode-forwards ${
        isClosing ? 'animate-out fade-out pointer-events-none' : 'animate-in fade-in'
      }`}
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-[#121a2f]/75 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-title"
        onKeyDown={handleModalKeyDown}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto z-10 relative border border-slate-100 duration-300 ease-out fill-mode-forwards ${
          isClosing 
            ? 'animate-out fade-out zoom-out-95 slide-out-to-bottom-4' 
            : 'animate-in fade-in zoom-in-95 slide-in-from-bottom-4'
        }`}
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between z-20">
          <div>
            <h3 id="enquiry-modal-title" className="text-2xl font-extrabold text-[#1e2e5e] flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#c1272d]/10 text-xl text-[#c1272d]">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              Product Inquiry
            </h3>
            <p className="text-sm font-medium text-slate-400 mt-1">
              Mohit Sales Corporation Pvt. Ltd.
            </p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all duration-200 border border-slate-100 hover:scale-105 active:scale-95"
            aria-label="Close modal"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Read-only Product Name Field */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-100/50 to-transparent pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e8434a] to-[#c1272d] flex items-center justify-center text-white text-2xl shadow-md relative z-10 shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="relative z-10">
              <span className="block text-xs font-bold text-[#c1272d] uppercase tracking-widest">Selected Product</span>
              <span className="block text-xl font-black text-[#1e2e5e] leading-tight mt-1">{productName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label htmlFor="enq-name" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                id="enq-name"
                ref={firstInputRef}
                type="text"
                name="name"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 text-base bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm placeholder:text-slate-400"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="enq-cname" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                Company Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                id="enq-cname"
                type="text"
                name="cname"
                required
                placeholder="Enter company name"
                value={formData.cname}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 text-base bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm placeholder:text-slate-400"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="enq-email" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                id="enq-email"
                type="email"
                name="email"
                required
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 text-base bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm placeholder:text-slate-400"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="enq-mobile" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                Phone Number <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                id="enq-mobile"
                type="tel"
                name="mobile"
                required
                placeholder="Enter contact number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 text-base bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Optional product preferences — colour & size */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Product Preferences <span className="text-slate-300 normal-case tracking-normal font-medium">(Optional)</span>
              </span>
              <span className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Preferred Colour */}
              <div>
                <label htmlFor="enq-color" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Preferred Colour
                </label>
                <input
                  id="enq-color"
                  type="text"
                  name="color"
                  placeholder="e.g. Red, Black, White"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 text-base bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm placeholder:text-slate-400"
                />
              </div>

              {/* Preferred Size */}
              <div>
                <label htmlFor="enq-size" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Preferred Size
                </label>
                <input
                  id="enq-size"
                  type="text"
                  name="size"
                  placeholder="e.g. 1.5 sqmm, 2.5 sqmm, 90m"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 text-base bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label htmlFor="enq-message" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Enquiry Message <span className="text-red-500 font-bold">*</span>
            </label>
            <textarea 
              id="enq-message"
              name="message"
              required
              rows={4}
              placeholder="Write your specifications or requirements"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 text-base bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm resize-none placeholder:text-slate-400"
            />
          </div>

          {/* File Upload Attachment */}
          <div>
            <label htmlFor="enq-file" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Attach RFQ / Specs <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-[#c1272d] rounded-xl p-6 transition-all duration-300 bg-slate-50/40 flex flex-col items-center justify-center cursor-pointer group hover:bg-white hover:shadow-md">
              <input 
                id="enq-file"
                type="file"
                aria-label="Attach a file (PDF, DOC, JPG or PNG)"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#c1272d]/10 text-slate-400 group-hover:text-[#c1272d] flex items-center justify-center mb-3 transition-colors duration-300">
                  <svg className="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#c1272d] transition-colors">
                  {file ? file.name : 'Click to upload RFQ or Specifications'}
                </span>
                {!file && (
                  <span className="text-xs text-slate-400 mt-1">
                    Supports PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Captcha Verification */}
          <div>
            <label htmlFor="enq-captcha" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Security Captcha <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div 
                className="bg-white border border-slate-300 rounded-xl overflow-hidden min-w-[120px] h-[52px] flex items-center justify-center select-none"
                dangerouslySetInnerHTML={{ __html: captchaSvg || '<span class="text-xs text-slate-400">Loading...</span>' }}
              />
              <button 
                type="button" 
                onClick={generateCaptcha}
                className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm"
                title="Refresh code"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <input 
                id="enq-captcha"
                type="text"
                name="captchaInput"
                required
                placeholder="Type code"
                value={formData.captchaInput}
                onChange={handleChange}
                className="w-[140px] px-4 py-3.5 rounded-xl border border-slate-200 text-center font-bold text-slate-800 text-base focus:outline-none focus:ring-4 focus:ring-[#c1272d]/10 focus:border-[#c1272d] transition-all duration-200 shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Status Message Alerts */}
          {statusMessage && (
            <div 
              className={`p-4 rounded-xl text-sm font-medium border animate-fadeIn ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                  : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}
            >
              {statusMessage.type === 'success' ? '✅' : '❌'} {statusMessage.text}
            </div>
          )}

          {/* Action buttons — Submit reuses the site's Send-Enquiry button
              (.rs-btn has-theme-orange has-icon has-bg): red fill, navy wipe on
              hover, and the two-arrow icon swap, so it matches every other
              enquiry button on the site. */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-7 h-[60px] inline-flex items-center justify-center rounded-[2px] border border-slate-200 text-slate-600 text-base font-semibold hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all duration-200 active:bg-slate-100 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rs-btn has-theme-orange has-icon has-bg"
              style={{ opacity: isSubmitting ? 0.65 : 1, pointerEvents: isSubmitting ? 'none' : undefined }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  Submit Enquiry
                  <span className="icon-box">
                    <svg className="icon-first" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                    </svg>
                    <svg className="icon-second" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                    </svg>
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
