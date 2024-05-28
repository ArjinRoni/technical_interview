'use client';
import './modal.css';

import { useUI } from '@/contexts/UIContext';

const Modal = ({ children }) => {
  const { isSidebarOpen } = useUI();

  return (
    <div className="modal" style={{ marginLeft: isSidebarOpen ? 108 : 0 }}>
      <div className="modal-content">{children}</div>
    </div>
  );
};

export default Modal;
