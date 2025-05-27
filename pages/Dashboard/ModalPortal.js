import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }) {
  const modalRoot = typeof window !== 'undefined' ? document.getElementById('modal-root') : null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  return modalRoot ? createPortal(children, modalRoot) : null;
}
