import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/actions/auth';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    const result = await registerUser(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);

    // Trigger success visual effect
    document.body.style.transition = 'background-color 1s ease';
    document.body.style.backgroundColor = '#e6fcf5';

    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  return {
    loading,
    success,
    errorMsg,
    register,
  };
}
