import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserIcon, FormsIcon, BuildingIcon, SearchIcon } from '../common/Icons'
import Toast from '../common/Toast'
import api from '../../services/api'

function EditarAvaliacao() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    funcionarioCpf: '',
    avaliadorCpf: '',
    questionarioId: '',
    local: '',
    descricao: ''
  })

  const [funcionarios, setFuncionarios] = useState([])
  const [avaliadores, setAvaliadores] = useState([])
  const [questionarios, setQuestionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermAvaliadores, setSearchTermAvaliadores] = useState('')

  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Carregar avaliação existente, funcionários, avaliadores e questionários em paralelo
      const [avaliacaoData, funcionariosData, avaliadoresData, questionariosData] = await Promise.all([
        api.getAvaliacao(id),
        api.getFuncionarios(null, null, 1, 1000),
        api.getAvaliadores(),
        api.getQuestionarios()
      ])

      // Preencher formulário com dados da avaliação
      if (avaliacaoData) {
        setFormData({
          funcionarioCpf: avaliacaoData.funcionario_cpf || '',
          avaliadorCpf: avaliacaoData.avaliador_cpf || '',
          questionarioId: avaliacaoData.questionario_id ? String(avaliacaoData.questionario_id) : (avaliacaoData.questionario_cod ? String(avaliacaoData.questionario_cod) : ''),
          local: avaliacaoData.local || '',
          descricao: avaliacaoData.descricao || ''
        })
      }

      // Extrair funcionários da resposta
      let funcionariosList = []
      if (Array.isArray(funcionariosData)) {
        funcionariosList = funcionariosData
      } else if (funcionariosData && funcionariosData.funcionarios) {
        funcionariosList = funcionariosData.funcionarios
      } else if (funcionariosData && Array.isArray(funcionariosData.data)) {
        funcionariosList = funcionariosData.data
      }
      
      setFuncionarios(funcionariosList)
      setAvaliadores(Array.isArray(avaliadoresData) ? avaliadoresData : [])
      setQuestionarios(Array.isArray(questionariosData) ? questionariosData : [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('error', 'Erro ao carregar dados', 'Não foi possível carregar as informações. Tente novamente.')
      setFuncionarios([])
      setAvaliadores([])
      setQuestionarios([])
    } finally {
      setLoading(false)
    }
  }

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
    
    if (!formData.funcionarioCpf.trim()) {
      newErrors.funcionarioCpf = 'Selecione o funcionário a ser avaliado'
    }
    
    if (!formData.avaliadorCpf.trim()) {
      newErrors.avaliadorCpf = 'Selecione o avaliador'
    }
    
    if (!formData.questionarioId.trim()) {
      newErrors.questionarioId = 'Selecione o questionário'
    }

    // Verificar se o avaliador é diferente do funcionário avaliado
    if (formData.funcionarioCpf && formData.avaliadorCpf && 
        formData.funcionarioCpf === formData.avaliadorCpf) {
      newErrors.avaliadorCpf = 'O avaliador não pode ser o mesmo funcionário a ser avaliado'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('error', 'Erro de validação', 'Por favor, preencha todos os campos obrigatórios corretamente.')
      return
    }
    
    setSubmitting(true)
    
    try {
      // Preparar dados para envio
      const dadosAvaliacao = {
        avaliado_cpf: formData.funcionarioCpf,
        avaliador_cpf: formData.avaliadorCpf,
        questionario_cod: parseInt(formData.questionarioId),
        local: formData.local || null,
        descricao: formData.descricao || null
      }
      
      await api.atualizarAvaliacao(id, dadosAvaliacao)
      
      showToast('success', 'Avaliação atualizada', 'As configurações da avaliação foram atualizadas com sucesso.')
      
      setTimeout(() => {
        navigate('/avaliacoes')
      }, 1500)
      
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error)
      
      const errorMessage = error.response?.data?.error || error.message || 'Não foi possível atualizar a avaliação. Tente novamente.'
      showToast('error', 'Erro ao atualizar avaliação', errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  // Filtrar funcionários com base na busca
  const funcionariosFiltrados = funcionarios.filter(funcionario => {
    if (!searchTerm.trim()) return true
    const termo = searchTerm.toLowerCase()
    return (
      funcionario.nome?.toLowerCase().includes(termo) ||
      funcionario.cpf?.includes(termo) ||
      funcionario.email?.toLowerCase().includes(termo) ||
      funcionario.setor?.toLowerCase().includes(termo)
    )
  })

  // Filtrar avaliadores com base na busca
  const avaliadoresFiltrados = avaliadores.filter(avaliador => {
    if (!searchTermAvaliadores.trim()) return true
    const termo = searchTermAvaliadores.toLowerCase()
    return (
      avaliador.nome?.toLowerCase().includes(termo) ||
      avaliador.cpf?.includes(termo) ||
      avaliador.email?.toLowerCase().includes(termo) ||
      avaliador.setor?.toLowerCase().includes(termo)
    )
  })

  // Buscar funcionário selecionado
  const funcionarioSelecionado = funcionarios.find(f => f.cpf === formData.funcionarioCpf)
  const avaliadorSelecionado = avaliadores.find(a => a.cpf === formData.avaliadorCpf)
  const questionarioSelecionado = questionarios.find(q => q.id === parseInt(formData.questionarioId))

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Editar Avaliação</h2>
          <p>Edite as configurações da avaliação</p>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-container">
            <div className="form-layout">
              {/* Card Esquerdo - Funcionário a ser Avaliado */}
              <div className="form-block left-block">
                <div className="block-header">
                  <h3>1. Funcionário a ser Avaliado</h3>
                  <p>Selecione o funcionário que será avaliado</p>
                </div>
                
                <div className="block-content">
                  {/* Funcionário Selecionado ou Estado Vazio */}
                  {funcionarioSelecionado ? (
                    <div className="selected-funcionario">
                      <h4>Funcionário Selecionado:</h4>
                      <div className="funcionario-card">
                        <div className="funcionario-info">
                          <h5>{funcionarioSelecionado.nome}</h5>
                          <p><strong>Email:</strong> {funcionarioSelecionado.email}</p>
                          <p><strong>Setor:</strong> {funcionarioSelecionado.setor}</p>
                          <p><strong>CPF:</strong> {funcionarioSelecionado.cpf}</p>
                          {funcionarioSelecionado.status && (
                            <p><strong>Status:</strong> <span className={`badge ${funcionarioSelecionado.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>{funcionarioSelecionado.status}</span></p>
                          )}
                        </div>
                        <button 
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => setFormData(prev => ({ ...prev, funcionarioCpf: '' }))}
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-selection-card">
                      <div className="empty-selection-content">
                        <h4>Nenhum Funcionário Selecionado</h4>
                        <p>Selecione um funcionário da lista abaixo para continuar</p>
                      </div>
                    </div>
                  )}

                  {/* Busca de funcionário */}
                  <div className="form-group search-section-top" style={{ marginTop: '20px' }}>
                    <label htmlFor="search-funcionario">Buscar Funcionário</label>
                    <div className="search-input-group">
                      <input
                        type="text"
                        id="search-funcionario"
                        placeholder="Digite o nome, CPF, email ou setor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                      />
                      <span className="search-icon"><SearchIcon /></span>
                    </div>
                  </div>

                  {/* Lista de Funcionários */}
                  <div className="funcionarios-list">
                    <h4>Funcionários Disponíveis ({funcionariosFiltrados.length})</h4>
                    {funcionariosFiltrados.length > 0 ? (
                      <div className="funcionarios-grid">
                        {funcionariosFiltrados.map(funcionario => (
                          <div 
                            key={funcionario.cpf} 
                            className={`funcionario-item ${formData.funcionarioCpf === funcionario.cpf ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, funcionarioCpf: funcionario.cpf }))}
                          >
                            <div className="funcionario-item-info">
                              <h5>{funcionario.nome}</h5>
                              <p><strong>Email:</strong> {funcionario.email}</p>
                              <p><strong>Setor:</strong> {funcionario.setor}</p>
                              <p><strong>CPF:</strong> {funcionario.cpf}</p>
                              <p><strong>Status:</strong> <span className={`badge ${funcionario.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>{funcionario.status}</span></p>
                            </div>
                            <div className="funcionario-item-actions">
                              {formData.funcionarioCpf === funcionario.cpf ? (
                                <span className="selected-indicator">✓ Selecionado</span>
                              ) : (
                                <button 
                                  type="button"
                                  className="btn-primary btn-sm"
                                >
                                  Selecionar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <UserIcon />
                        <h4>Nenhum funcionário encontrado</h4>
                        <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Não há funcionários cadastrados'}</p>
                      </div>
                    )}
                  </div>
                  {errors.funcionarioCpf && (
                    <span className="error-message" style={{ display: 'block', marginTop: '12px', color: '#dc2626' }}>{errors.funcionarioCpf}</span>
                  )}
                </div>
              </div>

              {/* Card Direito - Avaliador */}
              <div className="form-block right-block">
                <div className="block-header">
                  <h3>2. Avaliador</h3>
                  <p>Selecione o avaliador responsável pela avaliação</p>
                </div>
                
                <div className="block-content">
                  {/* Avaliador Selecionado ou Estado Vazio */}
                  {avaliadorSelecionado ? (
                    <div className="selected-funcionario">
                      <h4>Avaliador Selecionado:</h4>
                      <div className="funcionario-card">
                        <div className="funcionario-info">
                          <h5>{avaliadorSelecionado.nome}</h5>
                          {avaliadorSelecionado.email && (
                            <p><strong>Email:</strong> {avaliadorSelecionado.email}</p>
                          )}
                          {avaliadorSelecionado.setor && (
                            <p><strong>Setor:</strong> {avaliadorSelecionado.setor}</p>
                          )}
                          <p><strong>CPF:</strong> {avaliadorSelecionado.cpf}</p>
                          {(avaliadorSelecionado.status || avaliadorSelecionado.total_certificados) && (
                            <p>
                              {avaliadorSelecionado.status && (
                                <>
                                  <strong>Status:</strong> <span className={`badge ${avaliadorSelecionado.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>{avaliadorSelecionado.status}</span>
                                </>
                              )}
                              {avaliadorSelecionado.total_certificados && (
                                <span style={{ marginLeft: avaliadorSelecionado.status ? '15px' : '0' }}>
                                  <strong>Certificados:</strong> {avaliadorSelecionado.total_certificados}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <button 
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => setFormData(prev => ({ ...prev, avaliadorCpf: '' }))}
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-selection-card">
                      <div className="empty-selection-content">
                        <h4>Nenhum Avaliador Selecionado</h4>
                        <p>Selecione um avaliador da lista abaixo para continuar</p>
                      </div>
                    </div>
                  )}

                  {/* Busca de avaliador */}
                  <div className="form-group search-section-top" style={{ marginTop: '20px' }}>
                    <label htmlFor="search-avaliador">Buscar Avaliador</label>
                    <div className="search-input-group">
                      <input
                        type="text"
                        id="search-avaliador"
                        placeholder="Digite o nome, CPF, email ou setor..."
                        value={searchTermAvaliadores}
                        onChange={(e) => setSearchTermAvaliadores(e.target.value)}
                        className="form-input"
                      />
                      <span className="search-icon"><SearchIcon /></span>
                    </div>
                  </div>

                  {/* Lista de Avaliadores */}
                  <div className="funcionarios-list">
                    <h4>Avaliadores Disponíveis ({avaliadoresFiltrados.length})</h4>
                    {avaliadoresFiltrados.length > 0 ? (
                      <div className="funcionarios-grid">
                        {avaliadoresFiltrados.map(avaliador => (
                          <div 
                            key={avaliador.cpf} 
                            className={`funcionario-item ${formData.avaliadorCpf === avaliador.cpf ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, avaliadorCpf: avaliador.cpf }))}
                          >
                            <div className="funcionario-item-info">
                              <h5>{avaliador.nome}</h5>
                              {avaliador.email && (
                                <p><strong>Email:</strong> {avaliador.email}</p>
                              )}
                              {avaliador.setor && (
                                <p><strong>Setor:</strong> {avaliador.setor}</p>
                              )}
                              <p><strong>CPF:</strong> {avaliador.cpf}</p>
                              {avaliador.total_certificados && (
                                <p><strong>Certificados:</strong> {avaliador.total_certificados}</p>
                              )}
                              {avaliador.status && (
                                <p><strong>Status:</strong> <span className={`badge ${avaliador.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>{avaliador.status}</span></p>
                              )}
                            </div>
                            <div className="funcionario-item-actions">
                              {formData.avaliadorCpf === avaliador.cpf ? (
                                <span className="selected-indicator">✓ Selecionado</span>
                              ) : (
                                <button 
                                  type="button"
                                  className="btn-primary btn-sm"
                                >
                                  Selecionar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <UserIcon />
                        <h4>Nenhum avaliador encontrado</h4>
                        <p>{searchTermAvaliadores ? 'Tente ajustar os termos de busca' : 'Não há avaliadores cadastrados no sistema'}</p>
                      </div>
                    )}
                  </div>
                  {errors.avaliadorCpf && (
                    <span className="error-message" style={{ display: 'block', marginTop: '12px', color: '#dc2626' }}>{errors.avaliadorCpf}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Questionário e Campos Opcionais */}
          <div className="form-section-container" style={{ marginTop: '30px' }}>
            <div className="form-block full-block">
              <div className="block-header">
                <h3>3. Questionário e Informações Adicionais</h3>
                <p>Selecione o questionário e preencha informações opcionais</p>
              </div>
              
              <div className="block-content">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                  {/* Coluna Esquerda - Questionário */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Seleção de Questionário */}
                    <div className="form-group">
                      <label htmlFor="questionarioId" className="form-label">
                        <FormsIcon /> Questionário *
                      </label>
                      <select
                        id="questionarioId"
                        name="questionarioId"
                        value={formData.questionarioId}
                        onChange={handleInputChange}
                        className={`form-input ${errors.questionarioId ? 'error' : ''}`}
                        disabled={submitting}
                        required
                      >
                        <option value="">Selecione o questionário a ser aplicado</option>
                        {questionarios.filter(q => q.status === 'Ativo').length === 0 ? (
                          <option value="" disabled>
                            Nenhum questionário ativo disponível
                          </option>
                        ) : (
                          questionarios
                            .filter(q => q.status === 'Ativo')
                            .map(questionario => (
                              <option key={questionario.id} value={questionario.id}>
                                {questionario.titulo} 
                                {questionario.tipo ? ` - ${questionario.tipo}` : ''}
                                {questionario.classificacao ? ` (${questionario.classificacao})` : ''}
                                {questionario.total_perguntas ? ` - ${questionario.total_perguntas} pergunta${questionario.total_perguntas > 1 ? 's' : ''}` : ''}
                              </option>
                            ))
                        )}
                      </select>
                      {errors.questionarioId && (
                        <span className="error-message" style={{ display: 'block', marginTop: '8px', color: '#dc2626' }}>{errors.questionarioId}</span>
                      )}
                      
                      {/* Informações do questionário selecionado */}
                      {questionarioSelecionado ? (
                        <div className="selected-funcionario" style={{ marginTop: '15px' }}>
                          <h4>Questionário Selecionado:</h4>
                          <div className="funcionario-card">
                            <div className="funcionario-info">
                              <h5>{questionarioSelecionado.titulo}</h5>
                              {questionarioSelecionado.tipo && (
                                <p><strong>Tipo:</strong> {questionarioSelecionado.tipo}</p>
                              )}
                              {questionarioSelecionado.classificacao && (
                                <p><strong>Classificação:</strong> {questionarioSelecionado.classificacao}</p>
                              )}
                              {questionarioSelecionado.total_perguntas !== undefined && (
                                <p><strong>Total de Perguntas:</strong> {questionarioSelecionado.total_perguntas}</p>
                              )}
                              {questionarioSelecionado.status && (
                                <p><strong>Status:</strong> {questionarioSelecionado.status}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="empty-selection-card" style={{ marginTop: '15px' }}>
                          <div className="empty-selection-content">
                            <h4>Nenhum Questionário Selecionado</h4>
                            <p>Selecione um questionário da lista acima para continuar</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coluna Direita - Local e Descrição */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Campo Local */}
                    <div className="form-group">
                      <label htmlFor="local" className="form-label">
                        <BuildingIcon /> Local da Avaliação
                      </label>
                      <input
                        type="text"
                        id="local"
                        name="local"
                        value={formData.local}
                        onChange={handleInputChange}
                        placeholder="Ex: Sala de Reuniões, Escritório, Remoto..."
                        className="form-input"
                        disabled={submitting}
                      />
                    </div>

                    {/* Campo Descrição */}
                    <div className="form-group">
                      <label htmlFor="descricao" className="form-label">
                        Descrição / Observações
                      </label>
                      <textarea
                        id="descricao"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        placeholder="Adicione observações ou informações relevantes..."
                        className="form-input"
                        disabled={submitting}
                        rows={4}
                        style={{ resize: 'vertical', width: '100%', height: '161px', minHeight: '161px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Ação - Fora do card */}
          <div className="form-actions-bottom" style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'flex-end',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            maxWidth: '1400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/avaliacoes')}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner-small"></div>
                  Atualizando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast para mensagens */}
      <Toast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={5000}
      />

      <style jsx="true">{`
        .form-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .form-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          min-height: 600px;
        }

        .form-block {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .left-block {
          border-left: 4px solid #e91e63;
        }

        .right-block {
          border-left: 4px solid #3b82f6;
        }

        .full-block {
          border-left: 4px solid #10b981;
        }

        .block-header {
          padding: 25px 30px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .block-header h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
        }

        .block-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .block-content {
          padding: 25px 30px;
          flex: 1;
          max-height: 820px;
          position: relative;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .form-group label svg {
          width: 16px;
          height: 16px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #e91e63;
          box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
        }

        .form-input.error {
          border-color: #dc2626;
        }

        .search-input-group {
          position: relative;
        }

        .search-input-group .form-input {
          padding-right: 45px;
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .selected-funcionario {
          margin-top: 20px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          height: 200px;
          display: flex;
          flex-direction: column;
        }

        .selected-funcionario h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }

        .funcionario-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
        }

        .funcionario-info h5 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
        }

        .funcionario-info p {
          margin: 4px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .empty-selection-card {
          margin-top: 20px;
          padding: 20px;
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          text-align: center;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-selection-content h4 {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 16px;
        }

        .empty-selection-content p {
          margin: 0;
          color: #9ca3af;
          font-size: 14px;
        }

        .funcionarios-list {
          margin-top: 20px;
        }

        .funcionarios-list h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 15px;
          font-weight: 600;
        }

        .funcionarios-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 15px;
          max-height: 400px;
          overflow-y: auto;
        }

        .funcionario-item {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .funcionario-item:hover {
          border-color: #e91e63;
          box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);
        }

        .funcionario-item.selected {
          border-color: #e91e63;
          background: #fdf2f8;
          box-shadow: 0 4px 12px rgba(233, 30, 99, 0.15);
        }

        .funcionario-item-info h5 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 15px;
          font-weight: 600;
        }

        .funcionario-item-info p {
          margin: 4px 0;
          color: #6b7280;
          font-size: 13px;
        }

        .funcionario-item-actions {
          margin-top: 15px;
          display: flex;
          justify-content: flex-end;
        }

        .selected-indicator {
          color: #e91e63;
          font-weight: 600;
          font-size: 14px;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .empty-state svg {
          width: 48px;
          height: 48px;
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .empty-state h4 {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 16px;
        }

        .empty-state p {
          margin: 0;
          color: #9ca3af;
          font-size: 14px;
        }

        .error-message {
          color: #dc2626;
          font-size: 13px;
          margin-top: 5px;
        }

        @media (max-width: 1200px) {
          .form-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .form-container {
            max-width: 800px;
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .funcionario-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .block-header,
          .block-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default EditarAvaliacao

