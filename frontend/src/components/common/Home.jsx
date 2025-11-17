import React, { useState } from 'react'
import api from '../../services/api'
import ConfirmModal from './ConfirmModal'

function Home() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      await api.limparBancoDados()
      alert('Todos os dados foram excluídos com sucesso!')
      setIsDeleteModalOpen(false)
      // Recarregar a página para refletir as mudanças
      window.location.reload()
    } catch (error) {
      console.error('Erro ao excluir dados:', error)
      alert(error.response?.data?.error || 'Erro ao excluir dados do banco. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
        </div>
      </div>

      <p 
        className="dashboard-placeholder-text"
        style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          fontWeight: 500,
          maxWidth: '800px',
          marginInline: 'auto',
          lineHeight: 1.5,
          textAlign: 'center'
        }}
      >
        O Marcos não implementou nada da tela de dashboard ainda. Ele será o primeiro demitido do projeto.
      </p>

      <div 
        className="dashboard-placeholder"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '60vh',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundImage: 'url(/roberto_justus.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '40px'
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
            letterSpacing: '4px'
          }}
        >
          MARCOS
        </h1>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '30px'
      }}>
        <button
          onClick={handleDeleteClick}
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
          }}
          disabled={loading}
        >
          {loading ? 'Excluindo...' : '🗑️ Excluir Todos os Dados do Banco Antes de Ser Demitido'}
        </button>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="⚠️ Confirmar Exclusão de Todos os Dados"
        message="ATENÇÃO: Esta ação irá excluir TODOS os dados do banco de dados, incluindo funcionários, questionários, perguntas, avaliações e respostas. Esta ação NÃO PODE ser desfeita!"
        confirmText="Sim, Excluir Tudo"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default Home
