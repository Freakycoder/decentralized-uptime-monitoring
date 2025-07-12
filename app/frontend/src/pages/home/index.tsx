import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const router = useRouter();
  const { isValidated } = useAuth();

  useEffect(() => {
    // Redirect based on user validation status
    if (isValidated) {
      router.replace('/home/validator');
    } else {
      router.replace('/home/user');
    }
  }, [router, isValidated]);

  return null;
};

export default Home;