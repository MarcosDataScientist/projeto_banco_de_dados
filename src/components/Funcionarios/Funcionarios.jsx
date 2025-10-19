import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, EditIcon, DeleteIcon, CalendarIcon, UsersIcon, EyeIcon } from '../common/Icons'
import ConfirmModal from '../common/ConfirmModal'
import api from '../../services/api'

function Funcionarios() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [funcionarioToDelete, setFuncionarioToDelete] = useState(null)
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarFuncionarios()
  }, [])

  const carregarFuncionarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const dados = await api.getFuncionarios()
      setFuncionarios(dados)
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
      setError('Não foi possível carregar os funcionários. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (funcionario.cargo && funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (funcionario.setor && funcionario.setor.toLowerCase().includes(searchTerm.toLowerCase())) ||
    funcionario.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'badge-ativo'
      case 'processo de saída': return 'badge-rascunho'
      case 'desligado': return 'badge-inativo'
      default: return 'badge-default'
    }
  }

  const handleDeleteClick = (funcionario) => {
    setFuncionarioToDelete(funcionario)
    setIsModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (funcionarioToDelete) {
      try {
        await api.deletarFuncionario(funcionarioToDelete.id)
        // Atualizar a lista após deletar
        setFuncionarios(funcionarios.filter(f => f.cpf !== funcionarioToDelete.cpf))
        console.log('Funcionário excluído:', funcionarioToDelete)
      } catch (err) {
        console.error('Erro ao deletar funcionário:', err)
        alert('Erro ao excluir funcionário. Tente novamente.')
      }
    }
    setIsModalOpen(false)
    setFuncionarioToDelete(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFuncionarioToDelete(null)
  }

  // Calcular estatísticas
  const totalFuncionarios = funcionarios.length
  const emProcesso = funcionarios.filter(f => f.status.toLowerCase() === 'processo de saída').length
  const ativos = funcionarios.filter(f => f.status.toLowerCase() === 'ativo').length
  const departamentos = new Set(funcionarios.map(f => f.setor || f.departamento).filter(Boolean)).size

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando funcionários...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button onClick={carregarFuncionarios} className="btn-primary">Tentar novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Listagem funcionários</h2>
        
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{totalFuncionarios}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{emProcesso}</span>
          <span className="stat-label">Em Processo</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{ativos}</span>
          <span className="stat-label">Ativos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{departamentos}</span>
          <span className="stat-label">Departamentos</span>
        </div>
      </div>

      <div className="list-container">
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Buscar por nome, cargo, departamento ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-primary">
            <PlusIcon /> Novo Funcionário
          </button>
        </div>
        {filteredFuncionarios.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><UsersIcon /></span>
            <h3>Nenhum funcionário encontrado</h3>
            <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre seu primeiro funcionário para começar'}</p>
          </div>
        ) : (
          <div className="items-list">
            {filteredFuncionarios.map(funcionario => {
              // Extrair iniciais do nome
              const getInitials = (name) => {
                if (!name) return '?'
                const names = name.split(' ')
                if (names.length >= 2) {
                  return names[0][0] + names[names.length - 1][0]
                }
                return names[0][0]
              }

              const departamento = funcionario.setor || funcionario.departamento || 'Não informado'
              const cargo = funcionario.cargo || funcionario.tipo || 'Não informado'

              return (
                <div key={funcionario.cpf} className="list-item">
                  <div className="employee-avatar">
                    {funcionario.foto_url ? (
                      <img src={funcionario.foto_url} alt={funcionario.nome} className="avatar-image" />
                    ) : (
                      <div className="avatar-placeholder">
                        {getInitials(funcionario.nome)}
                      </div>
                    )}
                  </div>
                  <div className="item-main">
                    <div className="item-header">
                      <h4 className="item-title">{funcionario.nome}</h4>
                      <div className="item-badges">
                        <span className="badge badge-categoria">
                          {departamento}
                        </span>
                        <span className={`badge ${getStatusBadgeColor(funcionario.status)}`}>
                          {funcionario.status}
                        </span>
                      </div>
                    </div>
                    <p className="item-description">
                      <strong>{cargo}</strong>
                      {funcionario.email && ` • ${funcionario.email}`}
                      {funcionario.ctps && ` • CTPS: ${funcionario.ctps}`}
                    </p>
                    <div className="item-meta">
                      <span className="item-date">
                        <CalendarIcon /> CPF: {funcionario.cpf}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-action btn-edit" 
                      onClick={() => navigate(`/funcionarios/editar/${funcionario.cpf}`)}
                      title="Editar"
                    >
                      <EditIcon />
                    </button>
                    <button 
                      className="btn-action btn-preview"
                      title="Visualizar"
                    >
                      <EyeIcon />
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteClick(funcionario)}
                      title="Excluir"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Funcionário"
        message={`Tem certeza que deseja excluir o funcionário ${funcionarioToDelete?.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default Funcionarios
