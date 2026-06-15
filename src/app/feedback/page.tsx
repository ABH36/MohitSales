'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    client_existance: '',
    here_about: '',
    here_about_other: '',
    rating: '',
    feedback_type: '',
    feedback: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Captcha state variables
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const captchaAbortRef = useRef<AbortController | null>(null);

  const generateCaptcha = async () => {
    captchaAbortRef.current?.abort();
    const ctrl = new AbortController();
    captchaAbortRef.current = ctrl;
    try {
      const res = await fetch('/api/captcha', { signal: ctrl.signal });
      const data = await res.json();
      if (data.success) {
        setCaptchaSvg(data.svg);
        setCaptchaToken(data.token);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to generate captcha', err);
      }
    }
  };

  useEffect(() => {
    generateCaptcha();
    return () => captchaAbortRef.current?.abort();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (val: string) => {
    setFormData(prev => ({ ...prev, rating: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaInput) {
      setMessage({ type: 'error', text: 'Captcha code is required.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('client_existance', formData.client_existance);
      payload.append('here_about', formData.here_about === 'Other' ? formData.here_about_other : formData.here_about);
      payload.append('rating', formData.rating);
      payload.append('feedback_type', formData.feedback_type);
      payload.append('feedback', formData.feedback);
      payload.append('captchaInput', captchaInput);
      payload.append('captchaToken', captchaToken);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: payload
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Thank you! Your feedback has been successfully sent.' });
        setFormData({
          name: '',
          email: '',
          client_existance: '',
          here_about: '',
          here_about_other: '',
          rating: '',
          feedback_type: '',
          feedback: ''
        });
        setCaptchaInput('');
        generateCaptcha();
      } else {
        setMessage({ type: 'error', text: result.message || 'Something went wrong. Please try again.' });
        setCaptchaInput('');
        generateCaptcha();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit feedback. Please check your network connection.' });
      setCaptchaInput('');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ backgroundColor: '#d2e5fc', minHeight: '100vh', padding: '20px 0', fontFamily: '"Asap", sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .feedback-form-container {
          max-width: 600px;
          margin: 50px auto;
          background-color: #fff;
          padding: 40px 50px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .feedback-form-container h1 {
          margin: 0 0 10px 0;
          font-family: "Asap", sans-serif;
          text-align: center;
          font-weight: 700;
          font-size: 28px;
          color: #28166f;
        }
        .feedback-form-container h3 {
          margin-bottom: 40px;
          margin-top: 0;
          font-weight: 400;
          font-size: 16px;
          color: #555;
          font-family: "Asap", sans-serif;
          text-align: center;
          line-height: 1.5;
        }
        .logo-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .logo-section img {
          max-height: 50px;
          object-fit: contain;
        }
        .top_line {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          font-style: italic;
          margin: 0;
        }
        .divider {
          height: 1px;
          background-color: #ddd;
          margin: 15px 0 35px 0;
        }
        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .form-group label span {
          color: red;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 12px;
          font-size: 15px;
          background-color: #f9f9f9;
          transition: border-color 0.2s;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #28166f;
          background-color: #fff;
        }
        .rating-area {
          direction: rtl;
          unicode-bidi: bidi-override;
          font-size: 2rem;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 5px;
        }
        .rating-area > input {
          display: none;
        }
        .rating-area > label {
          display: inline-block;
          font-size: 36px;
          cursor: pointer;
          color: #ddd;
          transition: color 0.2s;
        }
        .rating-area > label:hover,
        .rating-area > label:hover ~ label,
        .rating-area > input:checked ~ label {
          color: gold;
        }
        .submit-btn {
          background-color: #28166f;
          color: #ffffff;
          font-weight: 600;
          padding: 14px;
          width: 100%;
          font-size: 18px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .submit-btn:hover {
          background-color: #1a0e4f;
        }
        .submit-btn:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }
        .alert-box {
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 15px;
          font-weight: 500;
          text-align: center;
        }
        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        @media (max-width: 576px) {
          .feedback-form-container {
            padding: 25px 20px;
            margin: 20px 10px;
          }
          .logo-section {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
        .captcha-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .captcha-box {
          display: inline-flex;
          padding: 0;
          overflow: hidden;
          height: 44px;
          background: #f1f5f9;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .captcha-refresh {
          color: #28166f;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }
        .captcha-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 15px;
          background-color: #f9f9f9;
        }
      ` }} />

      <div className="feedback-form-container">
        <div className="logo-section">
          <div>
            <img src="/assets/images/logo/msc_logo_without_bg.png" alt="Mohit Sales Corporation" style={{ maxHeight: '45px' }} />
          </div>
          <div className="text-right">
            <p className="top_line">Authorised Distributors of Wires & Cables</p>
          </div>
          <div>
            <img src="/assets/images/logo/polycab-logo.png" alt="Polycab Logo" style={{ maxHeight: '35px' }} />
          </div>
        </div>

        <div className="divider" />

        <h1>FEEDBACK FORM</h1>
        <h3>Your opinion matters to us. Let us know how we’re doing and what we can do better.</h3>

        {message && (
          <div className={`alert-box ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name <span>*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="CONTACT PERSON / ORGANISATION NAME"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email <span>*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="client_existance">Are you an existing client?</label>
            <select
              name="client_existance"
              id="client_existance"
              value={formData.client_existance}
              onChange={handleChange}
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="here_about">How did you hear about us? <span>*</span></label>
            <select
              name="here_about"
              id="here_about"
              value={formData.here_about}
              onChange={handleChange}
              required
            >
              <option value="">Select Option</option>
              <option value="Social Media">Social Media</option>
              <option value="Web Search">Web Search</option>
              <option value="Friend/Family">Friend/Family</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.here_about === 'Other' && (
            <div className="form-group">
              <label htmlFor="here_about_other">Please Specify <span>*</span></label>
              <input
                type="text"
                id="here_about_other"
                name="here_about_other"
                placeholder="Where did you hear about us?"
                value={formData.here_about_other}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Rate Us</label>
            <div className="rating-area">
              {[5, 4, 3, 2, 1].map((star) => (
                <React.Fragment key={star}>
                  <input
                    type="radio"
                    id={`star${star}`}
                    name="rating"
                    value={star}
                    checked={formData.rating === String(star)}
                    onChange={() => handleRatingChange(String(star))}
                  />
                  <label htmlFor={`star${star}`} title={`${star} star${star > 1 ? 's' : ''}`}>
                    ★
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="feedback_type">Type of Feedback</label>
            <select
              name="feedback_type"
              id="feedback_type"
              value={formData.feedback_type}
              onChange={handleChange}
            >
              <option value="">Select Option</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Complaint">Complaint</option>
              <option value="Compliment">Compliment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="feedback">Comments <span>*</span></label>
            <textarea
              name="feedback"
              id="feedback"
              rows={5}
              placeholder="Your comments or message..."
              value={formData.feedback}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Captcha <span>*</span></label>
            <div className="captcha-row">
              {captchaSvg && (
                <div 
                  className="captcha-box" 
                  dangerouslySetInnerHTML={{ __html: captchaSvg }} 
                />
              )}
              <span className="captcha-refresh" onClick={generateCaptcha}>Refresh</span>
              <input 
                type="text" 
                className="captcha-input" 
                placeholder="Type captcha code" 
                required 
                value={captchaInput} 
                onChange={(e) => setCaptchaInput(e.target.value)} 
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </main>
  );
}
