import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SaveIcon, XIcon, UserIcon } from '../common/Icons'
import api from '../../services/api'

function EditarFuncionario() {
  const { id } = useParams() // id aqui é o CPF
  const navigate = useNavigate()
  
  const [funcionario, setFuncionario] = useState({
    cpf: '',
    nome: '',
    email: '',
    setor: '',
    tipo: '',
    ctps: '',
    status: 'Ativo'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [setores, setSetores] = useState([])

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar funcionário e setores em paralelo
      const [funcionarioData, setoresData] = await Promise.all([
        api.getFuncionario(id),
        api.getDepartamentos()
      ])

      setFuncionario({
        cpf: funcionarioData.cpf || '',
        nome: funcionarioData.nome || '',
        email: funcionarioData.email || '',
        setor: funcionarioData.setor || '',
        tipo: funcionarioData.tipo || '',
        ctps: funcionarioData.ctps || '',
        status: funcionarioData.status || 'Ativo'
      })

      setSetores(setoresData)
    } catch (err) {
      console.error('Erro ao carregar funcionário:', err)
      setError('Não foi possível carregar os dados do funcionário.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFuncionario(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Enviar apenas os campos editáveis (sem CPF)
      const dadosParaEnvio = {
        nome: funcionario.nome,
        email: funcionario.email,
        setor: funcionario.setor,
        tipo: funcionario.tipo,
        ctps: funcionario.ctps,
        status: funcionario.status
      }
      
      await api.atualizarFuncionario(id, dadosParaEnvio)
      alert('Funcionário atualizado com sucesso!')
      navigate('/funcionarios')
    } catch (err) {
      console.error('Erro ao atualizar funcionário:', err)
      alert('Erro ao atualizar funcionário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/funcionarios')
  }

  const getInitials = (name) => {
    if (!name) return ''
    const names = name.split(' ')
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0]
    }
    return names[0][0]
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados do funcionário...</p>
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
          <button onClick={carregarDados} className="btn-primary">Tentar novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Editar Funcionário</h2>
        <p>Atualize as informações do funcionário</p>
      </div>

      <div className="form-container">
        <div className="form-card">
          {/* Avatar Section */}
          <div className="form-avatar-section">
            <div className="form-avatar-placeholder">
              {getInitials(funcionario.nome)}
            </div>
            <div className="form-avatar-info">
              <h3>{funcionario.nome || 'Nome do Funcionário'}</h3>
              <p className="form-avatar-subtitle">CPF: {funcionario.cpf}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome" className="form-label">
                  Nome Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={funcionario.nome}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cpf" className="form-label">
                  CPF <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={funcionario.cpf}
                  className="form-input"
                  placeholder="000.000.000-00"
                  disabled
                  title="CPF não pode ser alterado"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  E-mail <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={funcionario.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="email@empresa.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ctps" className="form-label">
                  CTPS
                </label>
                <input
                  type="text"
                  id="ctps"
                  name="ctps"
                  value={funcionario.ctps}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="00000/0000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="setor" className="form-label">
                  Setor <span className="required">*</span>
                </label>
                {setores.length > 0 ? (
                  <select
                    id="setor"
                    name="setor"
                    value={funcionario.setor}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Selecione um setor</option>
                    {setores.map((setor) => (
                      <option key={setor.nome} value={setor.nome}>
                        {setor.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="setor"
                    name="setor"
                    value={funcionario.setor}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Digite o setor"
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="tipo" className="form-label">
                  Tipo/Cargo
                </label>
                <input
                  type="text"
                  id="tipo"
                  name="tipo"
                  value={funcionario.tipo}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: Desenvolvedor, Analista"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Status <span className="required">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={funcionario.status}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Processo de Saída">Processo de Saída</option>
                  <option value="Desligado">Desligado</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-cancel" disabled={loading}>
                <XIcon /> Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                <SaveIcon /> {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditarFuncionario
