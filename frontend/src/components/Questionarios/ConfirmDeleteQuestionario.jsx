import React, { useState } from 'react'
import { XIcon, AlertCircleIcon, DeleteIcon } from '../common/Icons'

function ConfirmDeleteQuestionario({ isOpen, onClose, onConfirm, questionario }) {
  const [loading, setLoading] = useState(false)

  if (!isOpen || !questionario) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm()
      handleClose()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon modal-icon-danger">
            <AlertCircleIcon />
          </div>
          <h3>Excluir Questionário</h3>
        </div>

        <div className="modal-body">
          <div className="warning-box">
            <div>
              <strong>ATENÇÃO: Esta ação é irreversível!</strong>
              <p>Ao excluir este questionário, as seguintes ações serão realizadas:</p>
            </div>
          </div>

          <ul className="delete-consequences">
            <li>Todas as <strong>respostas</strong> relacionadas a avaliações deste questionário serão deletadas</li>
            <li>Todas as <strong>avaliações</strong> que utilizaram este questionário serão deletadas</li>
            <li>Os <strong>vínculos com perguntas</strong> serão removidos</li>
            <li>O <strong>questionário</strong> será permanentemente excluído</li>
          </ul>

          <div className="questionario-info">
            <p className="questionario-info-title"><strong>Informações do questionário</strong></p>
            <div className="questionario-details">
              <p className="questionario-name">{questionario.titulo}</p>
              <div className="questionario-stats">
                <span>{questionario.total_perguntas || 0} perguntas</span>
                <span>{questionario.total_aplicacoes || 0} aplicações</span>
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Não
          </button>
          <button
            className="btn-danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Excluindo...' : (
              <>
                <DeleteIcon /> Sim, Excluir
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-danger {
          border-top: 4px solid #dc2626;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-header-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-icon-danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .modal-header h3 {
          flex: 1;
          margin: 0;
          font-size: 20px;
          color: #1f2937;
        }

        .modal-body {
          padding: 24px;
        }

        .warning-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin-bottom: 20px;
          color: #991b1b;
          text-align: center;
          justify-content: center;
        }

        .warning-box svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .warning-box strong {
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }

        .warning-box p {
          margin: 0;
          font-size: 14px;
        }

        .delete-consequences {
          margin: 0 0 24px 0;
          padding: 0 0 0 20px;
          list-style: none;
          text-align: left;
        }

        .delete-consequences li {
          padding: 8px 0;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .delete-consequences li:last-child {
          border-bottom: none;
        }

        .questionario-info {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          text-align: center;
        }

        .questionario-info-title {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .questionario-details {
          padding: 12px;
          background: white;
          border-radius: 6px;
        }

        .questionario-name {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          word-break: break-word;
        }

        .questionario-stats {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #6b7280;
          justify-content: center;
          align-items: center;
        }


        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f9fafb;
          border-radius: 0 0 12px 12px;
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          color: #6b7280;
          transition: color 0.2s;
        }

        .btn-icon:hover {
          color: #1f2937;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-danger:hover:not(:disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default ConfirmDeleteQuestionario

