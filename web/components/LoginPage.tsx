'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { Space_Grotesk } from 'next/font/google';

const CandlestickScene = dynamic(() => import('./CandlestickScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-brand-dark to-brand-bg" />
  ),
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (method: 'google' | 'wallet' | 'email') => {
    setError(null);
    setLoadingMethod(method);
    
    try {
      await login();
    } catch (err) {
      setError(`${method} sign-in is blocked, try another method`);
      setLoadingMethod(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-brand-bg">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 -z-10">
        <CandlestickScene />
      </div>

      {/* Two Column Layout */}
      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left Column - Pitch */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-24">
          <div 
            className={`max-w-xl space-y-8 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}
            style={{
              animationDelay: '200ms',
              animationFillMode: 'forwards',
            }}
          >
            {/* Logo */}
            <div className={`${spaceGrotesk.className} text-4xl font-bold tracking-tight text-brand-mint`}>
              Tiltless.
            </div>

            {/* Headline */}
            <h1 className={`${spaceGrotesk.className} text-4xl font-bold leading-tight text-white lg:text-5xl`}>
              Your PnL shows what happened. <br />
              <span className="text-brand-mint">Tiltless shows why.</span>
            </h1>

            {/* Trust Points */}
            <div className="space-y-4 text-white/70">
              <div className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-white">Read-only analysis.</strong> We never touch your wallet or funds.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-white">Public blockchain data.</strong> All numbers computed from on-chain history.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-white">No wallet connection required.</strong> Just paste any address to analyze.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Card */}
        <div className="flex items-center justify-center px-6 py-12 lg:px-16 lg:py-24">
          <div
            className={`w-full max-w-md ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
            style={{
              animationDelay: '400ms',
              animationFillMode: 'forwards',
            }}
          >
            {/* Glass Card */}
            <div className="glass-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/10">
              {/* Glare effect */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              </div>

              <div className="relative space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                  <p className="text-sm text-white/60">Sign in to analyze your trading behavior</p>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Google Button */}
                  <button
                    onClick={() => handleLogin('google')}
                    disabled={loadingMethod !== null}
                    className="group/btn relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loadingMethod === 'google' ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <svg className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Continue with Google
                    </span>
                  </button>

                  {/* Wallet Button */}
                  <button
                    onClick={() => handleLogin('wallet')}
                    disabled={loadingMethod !== null}
                    className="group/btn relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loadingMethod === 'wallet' ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <svg className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      )}
                      Connect Wallet
                    </span>
                  </button>

                  {/* Email Button */}
                  <button
                    onClick={() => handleLogin('email')}
                    disabled={loadingMethod !== null}
                    className="group/btn relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loadingMethod === 'email' ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <svg className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      Continue with Email
                    </span>
                  </button>
                </div>

                {/* Privacy Note */}
                <div className="space-y-2 pt-4 text-center text-xs text-white/40">
                  <p>We use your login only to protect the service. Wallet analysis uses public blockchain data.</p>
                  <p className="font-semibold">Informational only, not financial advice.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn,
          .animate-fadeInUp {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
