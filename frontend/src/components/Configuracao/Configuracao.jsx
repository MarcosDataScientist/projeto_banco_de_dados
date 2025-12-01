import React, { useState } from 'react'
import api from '../../services/api'
import ConfirmModal from '../common/ConfirmModal'
import Toast from '../common/Toast'
import { SettingsIcon, DeleteIcon } from '../common/Icons'

function Configuracao() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  const handleDeleteClick = () => {
    setShowConfirm(true)
  }

  const handleCloseConfirm = () => {
    if (!loading) {
      setShowConfirm(false)
    }
  }

  const handleShowToast = (type, title, message) => {
    setToast({ show: true, type, title, message })
  }

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }))
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      await api.limparBancoDados()
      setShowConfirm(false)
      handleShowToast(
        'success',
        'Dados apagados com sucesso',
        'Todos os dados do banco foram removidos. Você pode recarregar as seeds se necessário.'
      )
    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error)
      handleShowToast(
        'error',
        'Erro ao apagar dados',
        'Ocorreu um erro ao tentar limpar o banco de dados. Verifique o servidor e tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon />
          <h2>Configuração</h2>
        </div>
      </div>

      <div className="list-container">
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '720px',
            margin: '0 auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: '12px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#991b1b'
            }}
          >
            Zona de Perigo
          </h3>
          <p
            style={{
              marginTop: 0,
              marginBottom: '20px',
              fontSize: '14px',
              color: '#7f1d1d',
              lineHeight: 1.5
            }}
          >
            Esta ação irá <strong>apagar todos os dados do banco de dados</strong>, incluindo funcionários,
            questionários, avaliações, respostas e quaisquer outros registros. Não é possível desfazer.
          </p>

          <button
            type="button"
            className="btn-danger"
            onClick={handleDeleteClick}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            {loading ? (
              'Apagando dados...'
            ) : (
              <>
                <DeleteIcon /> Apagar todos os dados do banco
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Apagar todos os dados do banco?"
        message="Esta ação é irreversível e removerá todos os registros do sistema. Tem certeza de que deseja continuar?"
        confirmText={loading ? 'Apagando...' : 'Sim, apagar tudo'}
        cancelText="Cancelar"
      />

      <Toast
        show={toast.show}
        onClose={handleCloseToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  )
}

export default Configuracao


