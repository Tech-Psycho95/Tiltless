'use client';

import { usePrivy } from '@privy-io/react-auth';

export function useAuth() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();

  return {
    isReady: ready,
    isAuthenticated: authenticated,
    user,
    login,
    logout,
    getAccessToken,
  };
}

export function getShortAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
