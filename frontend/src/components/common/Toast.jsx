import React, { useEffect } from 'react'
import { CheckCircleIcon, AlertCircleIcon, XIcon } from './Icons'

/**
 * Componente Toast para mensagens de feedback
 * 
 * @param {boolean} show - Se o toast deve ser exibido
 * @param {function} onClose - Callback quando o toast é fechado
 * @param {string} type - Tipo do toast: 'success', 'error', 'warning', 'info'
 * @param {string} title - Título da mensagem
 * @param {string} message - Mensagem detalhada (opcional)
 * @param {number} duration - Duração em ms antes de auto-fechar (padrão: 5000)
 */
function Toast({ 
  show = false, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 5000 
}) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />
      case 'error':
      case 'warning':
        return <AlertCircleIcon />
      default:
        return <CheckCircleIcon />
    }
  }

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'toast-success'
      case 'error':
        return 'toast-error'
      case 'warning':
        return 'toast-warning'
      case 'info':
        return 'toast-info'
      default:
        return 'toast-success'
    }
  }

  return (
    <div className={`toast-container ${show ? 'toast-show' : ''}`}>
      <div className={`toast ${getTypeClass()}`}>
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-content">
          <h4 className="toast-title">{title}</h4>
          {message && <p className="toast-message">{message}</p>}
        </div>
        <button className="toast-close" onClick={onClose} aria-label="Fechar">
          <XIcon />
        </button>
      </div>

      <style jsx="true">{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          max-width: 420px;
          pointer-events: none;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .toast-container.toast-show {
          opacity: 1;
          transform: translateX(0);
          pointer-events: all;
        }

        .toast {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border-left: 4px solid;
          min-width: 320px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .toast-success {
          border-left-color: #10b981;
        }

        .toast-error {
          border-left-color: #ef4444;
        }

        .toast-warning {
          border-left-color: #f59e0b;
        }

        .toast-info {
          border-left-color: #3b82f6;
        }

        .toast-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-success .toast-icon {
          color: #10b981;
        }

        .toast-error .toast-icon {
          color: #ef4444;
        }

        .toast-warning .toast-icon {
          color: #f59e0b;
        }

        .toast-info .toast-icon {
          color: #3b82f6;
        }

        .toast-content {
          flex: 1;
          min-width: 0;
        }

        .toast-title {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.4;
        }

        .toast-message {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .toast-close {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: color 0.2s;
          border-radius: 4px;
        }

        .toast-close:hover {
          color: #4b5563;
          background: #f3f4f6;
        }

        .toast-close svg {
          width: 16px;
          height: 16px;
        }

        /* Responsivo */
        @media (max-width: 480px) {
          .toast-container {
            right: 16px;
            left: 16px;
            max-width: none;
          }

          .toast {
            min-width: auto;
          }
        }

        /* Animação de progresso */
        .toast::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: currentColor;
          opacity: 0.2;
          animation: progress linear;
          animation-duration: ${duration}ms;
        }

        .toast-success::after {
          background: #10b981;
        }

        .toast-error::after {
          background: #ef4444;
        }

        .toast-warning::after {
          background: #f59e0b;
        }

        .toast-info::after {
          background: #3b82f6;
        }

        @keyframes progress {
          from {
            transform: scaleX(1);
            transform-origin: left;
          }
          to {
            transform: scaleX(0);
            transform-origin: left;
          }
        }
      `}</style>
    </div>
  )
}

export default Toast

