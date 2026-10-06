import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

/** Usage : const toast = useToast(); toast('Enregistré'); toast('Erreur', true); */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast doit être utilisé dans <ToastProvider>');
  return toast;
}
