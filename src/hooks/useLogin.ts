import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/actions/auth';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginUser(formData);

      if (result.error) {
        setErrorMsg(result.error);
        setLoading(false);
        
        // Shake effect on the container
        setShake(true);
        setTimeout(() => {
          setShake(false);
        }, 500);
      } else {
        // Save to localStorage
        if (result.accessToken && result.refreshToken && result.user) {
          localStorage.setItem('access_token', result.accessToken);
          localStorage.setItem('refresh_token', result.refreshToken);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        // Success redirect
        router.push('/dashboard'); 
      }
    } catch (err) {
      console.error('Unhandled login error:', err);
      setErrorMsg('Terjadi kesalahan pada server. Silakan coba lagi.');
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    errorMsg,
    shake,
    login,
  };
}
