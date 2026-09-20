import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className="toast-notice" onClick={onClose} role="status">
      {type === 'success' && <CheckCircle2 size={16} color="#34D399" />}
      {type === 'error' && <AlertCircle size={16} color="#F87171" />}
      {type === 'info' && <Info size={16} color="#60A5FA" />}
      <span>{message}</span>
    </div>
  );
}
