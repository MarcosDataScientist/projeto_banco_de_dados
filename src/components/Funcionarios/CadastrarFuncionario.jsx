import React, { useState } from 'react'
import { XIcon, UserIcon, MailIcon, BuildingIcon, IdCardIcon, TagIcon } from '../common/Icons'
import api from '../../services/api'

function CadastrarFuncionario({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    email: '',
    setor: '',
    ctps: '',
    tipo: 'CLT',
    status: 'ativo'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve ter 11 dígitos'
    }
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.setor.trim()) {
      newErrors.setor = 'Setor é obrigatório'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      // Limpar CPF (remover pontos e traços)
      const cpfLimpo = formData.cpf.replace(/\D/g, '')
      
      const dadosFuncionario = {
        ...formData,
        cpf: cpfLimpo
      }
      
      await api.cadastrarFuncionario(dadosFuncionario)
      
      // Limpar formulário
      setFormData({
        cpf: '',
        nome: '',
        email: '',
        setor: '',
        ctps: '',
        tipo: 'CLT',
        status: 'ativo'
      })
      
      onSuccess?.()
      onClose()
      
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error)
      
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert('Erro ao cadastrar funcionário. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({
      ...prev,
      cpf: formatted
    }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Cadastrar Novo Funcionário</h3>
          <button 
            className="btn-close" 
            onClick={onClose}
            disabled={loading}
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cpf" className="form-label">
                <IdCardIcon /> CPF *
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength="14"
                className={`form-input ${errors.cpf ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.cpf && <span className="error-message">{errors.cpf}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nome" className="form-label">
                <UserIcon /> Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Nome completo do funcionário"
                className={`form-input ${errors.nome ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <MailIcon /> Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@empresa.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="setor" className="form-label">
                <BuildingIcon /> Setor/Departamento *
              </label>
              <input
                type="text"
                id="setor"
                name="setor"
                value={formData.setor}
                onChange={handleInputChange}
                placeholder="Ex: Recursos Humanos, TI, Vendas"
                className={`form-input ${errors.setor ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.setor && <span className="error-message">{errors.setor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ctps" className="form-label">
                <IdCardIcon /> CTPS
              </label>
              <input
                type="text"
                id="ctps"
                name="ctps"
                value={formData.ctps}
                onChange={handleInputChange}
                placeholder="Número da CTPS (opcional)"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo" className="form-label">
                <TagIcon /> Tipo de Contrato
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="form-select"
                disabled={loading}
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Estagiário">Estagiário</option>
                <option value="Terceirizado">Terceirizado</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CadastrarFuncionario
