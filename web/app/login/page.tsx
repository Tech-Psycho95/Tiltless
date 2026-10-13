import { AuthGate } from '@/components/AuthGate';
import { LoginPage } from '@/components/LoginPage';

export default function Login() {
  return (
    <AuthGate requireAuth={false}>
      <LoginPage />
    </AuthGate>
  );
}
