'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // 2FA OTP States
  const [otpStep, setOtpStep] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpVal, setOtpVal] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setProgress(10);
    const timer = setTimeout(() => setProgress(60), 100);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        clearTimeout(timer);
        setProgress(100);
        if (data.step === 'otp') {
          setTempToken(data.tempToken);
          setOtpStep(true);
          setResendTimer(60);
          setCanResend(false);
          setProgress(null);
          setLoading(false);
          return;
        }
        if (data.user) {
          sessionStorage.setItem('admin_user_cache', JSON.stringify({ user: data.user, timestamp: Date.now() }));
        }
        setTimeout(() => router.push('/admin/dashboard'), 200);
      } else {
        clearTimeout(timer);
        setProgress(null);
        setError(data.message || data.error || 'Login failed. Invalid credentials.');
      }
    } catch {
      clearTimeout(timer);
      setProgress(null);
      setError('An error occurred while connecting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpVal.join('');
    if (fullOtp.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    setProgress(20);
    const timer = setTimeout(() => setProgress(70), 100);
    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp: fullOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        clearTimeout(timer);
        setProgress(100);
        if (data.user) {
          sessionStorage.setItem('admin_user_cache', JSON.stringify({ user: data.user, timestamp: Date.now() }));
        }
        setTimeout(() => router.push('/admin/dashboard'), 200);
      } else {
        clearTimeout(timer);
        setProgress(null);
        setError(data.message || 'OTP verification failed.');
      }
    } catch {
      clearTimeout(timer);
      setProgress(null);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    setCanResend(false);
    setResendTimer(60);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.step === 'otp') {
        setTempToken(data.tempToken);
        setError('Verification code resent to your email.');
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch {
      setError('Failed to resend code. Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpVal(val.split('').concat(Array(6 - val.length).fill('')));
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0d2b2b' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');
        .login-input {
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid rgba(255,255,255,0.4);
          color: #0f1f1f;
          padding: 14px 16px;
          width: 100%;
          border-radius: 4px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input:focus {
          background: #ffffff;
          border-color: #e07820;
          box-shadow: 0 0 0 2px rgba(224,120,32,0.2);
        }
        .login-input::placeholder {
          color: #9ab8b8;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.12em;
          font-weight: 500;
        }
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover,
        .login-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #0f1f1f;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset;
          box-shadow: 0 0 0px 1000px #ffffff inset;
          transition: background-color 9999s ease-in-out 0s;
        }
        .login-btn {
          box-sizing: border-box;
          background: #e07820;
          color: #fff;
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center !important;
        }
        .login-btn:hover:not(:disabled) {
          background: #c96a18;
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .divider-line {
          width: 1px;
          background: rgba(255,255,255,0.18);
          align-self: stretch;
          margin: 40px 0;
        }
        .welcome-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 52px;
          color: #ffffff;
          letter-spacing: 0.02em;
          line-height: 1.1;
          margin-bottom: 10px;
          text-align: center;
        }
        .welcome-sub {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 40px;
          text-align: center;
        }
        .otp-box {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          background: #ffffff !important;
          border: 1px solid rgba(0,0,0,0.2);
          color: #0f1f1f !important;
          border-radius: 4px;
          outline: none;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s;
          -webkit-text-fill-color: #0f1f1f !important;
        }
        .otp-box:focus {
          background: #ffffff !important;
          border-color: #e07820;
        }
        .otp-box:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          -webkit-text-fill-color: #0f1f1f !important;
        }
      `}} />

      {/* Left Panel — Brand */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative" style={{ backgroundColor: '#0d2b2b' }}>
        <div className="flex flex-col items-center gap-8 select-none">
          <img
            src="/assets/images/logo/msc_logo_without_bg.png"
            alt="Mohit Sales Corporation"
            className="w-52 h-52 object-contain"
            style={{ filter: 'drop-shadow(0 6px 32px rgba(224,120,32,0.30))' }}
          />
          <div className="text-center">
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '32px', fontWeight: 400, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.2 }}>
              Mohit Sales Corporation
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.50)', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: '8px' }}>
              Pvt. Ltd.
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="divider-line hidden md:block" />

      {/* Right Panel — Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-10 py-12 relative">

        {/* Mobile logo */}
        <div className="md:hidden flex flex-col items-center mb-10">
          <img src="/assets/images/logo/msc_logo_without_bg.png" alt="MSC" className="w-16 h-16 object-contain mb-3" />
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Mohit Sales Corp.
          </div>
        </div>

        {/* Progress bar */}
        {progress !== null && (
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: '#e07820' }} />
          </div>
        )}

        <div className="w-full max-w-xs">
          {!otpStep ? (
            <>
              <p className="welcome-heading">Welcome</p>
              <p className="welcome-sub">Please login to Admin Dashboard.</p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded text-sm text-center" style={{ background: 'rgba(220,60,60,0.15)', border: '1px solid rgba(220,60,60,0.3)', color: '#ff8a8a', fontFamily: "'Inter',sans-serif", letterSpacing: '0.02em' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="relative w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="Email Address"
                    required
                    style={{ color: '#0f1f1f', background: '#ffffff' }}
                  />
                </div>

                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    placeholder="Password"
                    required
                    style={{ paddingRight: '44px', color: '#0f1f1f', background: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    style={{ color: '#6a9a9a', lineHeight: 0, background: 'none', border: 'none', padding: 0, boxShadow: 'none', outline: 'none', cursor: 'pointer' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="mt-2" />

                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : 'Login'}
                </button>

                <button
                  type="button"
                  onClick={() => alert('Please contact the system administrator to reset your credentials.')}
                  className="text-center focus:outline-none mt-1"
                  style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  Forgotten Your Password?
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="welcome-heading">Verify</p>
              <p className="welcome-sub">Enter the 6-digit code sent to your email.</p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded text-sm text-center" style={{ background: 'rgba(220,60,60,0.15)', border: '1px solid rgba(220,60,60,0.3)', color: '#ff8a8a', fontFamily: "'Inter',sans-serif" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                {/* Single hidden input captures all 6 digits; 6 divs display them */}
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <input
                    ref={el => { otpRefs.current[0] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpVal.join('')}
                    onChange={handleOtpInput}
                    autoFocus
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'text',
                      zIndex: 10,
                      fontSize: '24px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    {Array(6).fill(null).map((_, i) => (
                      <div
                        key={i}
                        onClick={() => otpRefs.current[0]?.focus()}
                        style={{
                          width: '48px',
                          height: '56px',
                          background: '#ffffff',
                          border: `2px solid ${otpVal[i] ? '#e07820' : 'rgba(0,0,0,0.2)'}`,
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '26px',
                          fontWeight: 700,
                          color: '#111111',
                          fontFamily: "'Inter', sans-serif",
                          cursor: 'text',
                          userSelect: 'none',
                        }}
                      >
                        {otpVal[i] || ''}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Verify OTP'}
                </button>

                <div className="flex justify-between items-center mt-5">
                  <button
                    type="button"
                    onClick={() => { setOtpStep(false); setError(''); setOtpVal(Array(6).fill('')); }}
                    style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={!canResend || loading}
                    onClick={handleResendOtp}
                    style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', letterSpacing: '0.08em', background: 'none', border: 'none', cursor: canResend ? 'pointer' : 'not-allowed', textTransform: 'uppercase', color: canResend ? '#e07820' : 'rgba(255,255,255,0.25)' }}
                  >
                    {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
