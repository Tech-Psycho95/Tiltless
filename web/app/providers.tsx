'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#0a0a0a',
        color: '#fff',
      }}>
        <div style={{
          maxWidth: '600px',
          padding: '2rem',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333',
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Missing Configuration</h1>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            <strong>NEXT_PUBLIC_PRIVY_APP_ID</strong> is not set in <code>web/.env.local</code>
          </p>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            To fix this:
          </p>
          <ol style={{ lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            <li>Get your Privy App ID from <a href="https://dashboard.privy.io" target="_blank" style={{ color: '#60a5fa' }}>dashboard.privy.io</a></li>
            <li>Add it to <code>web/.env.local</code>:</li>
          </ol>
          <pre style={{
            background: '#000',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '1rem',
            border: '1px solid #333',
          }}>
NEXT_PUBLIC_API_URL=http://localhost:3001{'\n'}
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
          </pre>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#888' }}>
            See <strong>QUICKSTART-AUTH.md</strong> for complete setup instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
