// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import './styles/globals.css';
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.push('/Auth/Login');
  }, [router]);

  return null; // or loading spinner
}
