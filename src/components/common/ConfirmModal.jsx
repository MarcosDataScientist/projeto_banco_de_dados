import React from 'react'
import { XIcon, AlertCircleIcon } from './Icons'

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar" }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <XIcon />
        </button>
        
        <div className="modal-icon-warning">
          <AlertCircleIcon />
        </div>
        
        <div className="modal-body">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-modal-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

