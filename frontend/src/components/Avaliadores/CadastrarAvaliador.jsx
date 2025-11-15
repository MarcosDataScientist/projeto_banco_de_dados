import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SaveIcon, XIcon, UserIcon, SearchIcon } from '../common/Icons'
import Toast from '../common/Toast'
import api from '../../services/api'

function CadastrarAvaliador() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const isInitialMount = useRef(true)
  
  // Estado do Toast
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })
  
  // Estados para lista de funcionários
  const [searchTerm, setSearchTerm] = useState('')
  const [funcionarios, setFuncionarios] = useState([])
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null)
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(true)
  
  // Estados para cadastro do certificado
  const [certificado, setCertificado] = useState({
    treinamento_cod: '',
    n_certificado: ''
  })
  
  // Estados para treinamentos disponíveis
  const [treinamentos, setTreinamentos] = useState([])

  useEffect(() => {
    carregarTreinamentos()
    carregarFuncionarios('')
    isInitialMount.current = false
  }, [])

  // Buscar funcionários quando o termo de busca mudar (com debounce)
  useEffect(() => {
    // Não buscar na primeira renderização (já foi carregado acima)
    if (isInitialMount.current) {
      return
    }

    const timeoutId = setTimeout(() => {
      carregarFuncionarios(searchTerm.trim())
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const carregarTreinamentos = async () => {
    try {
      const dados = await api.getTreinamentos()
      setTreinamentos(dados)
    } catch (err) {
      console.error('Erro ao carregar treinamentos:', err)
    }
  }

  const carregarFuncionarios = async (termoBusca = '') => {
    try {
      setLoadingFuncionarios(true)
      setError(null)
      
      // Buscar funcionários ativos, com busca opcional
      // Usar um per_page alto para buscar todos os ativos de uma vez
      const response = await api.getFuncionarios('Ativo', null, 1, 10000, termoBusca)
      
      // O endpoint retorna { funcionarios: [], pagination: {} }
      const funcionariosList = response.funcionarios || response || []
      
      // Garantir que são apenas ativos (filtro adicional de segurança)
      const funcionariosAtivos = Array.isArray(funcionariosList) 
        ? funcionariosList.filter(func => func.status === 'Ativo')
        : []
      
      setFuncionarios(funcionariosAtivos)
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar funcionários'
      setError(errorMessage)
      setFuncionarios([])
    } finally {
      setLoadingFuncionarios(false)
    }
  }

  const selecionarFuncionario = (funcionario) => {
    setFuncionarioSelecionado(funcionario)
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCertificado(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!funcionarioSelecionado) {
      setError('Selecione um funcionário')
      return
    }

    if (!certificado.treinamento_cod || !certificado.n_certificado) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Criar o vínculo funcionário-treinamento
      const dadosVinculo = {
        funcionario_cpf: funcionarioSelecionado.cpf,
        treinamento_cod: parseInt(certificado.treinamento_cod),
        n_certificado: certificado.n_certificado
      }
      
      await api.criarVinculoFuncionarioTreinamento(dadosVinculo)
      
      // Mostrar Toast de sucesso
      showToast(
        'success',
        'Avaliador cadastrado com sucesso!',
        `${funcionarioSelecionado.nome} foi cadastrado como avaliador e agora pode ser encontrado na lista de avaliadores.`
      )
      
      // Navegar após um pequeno delay para mostrar o Toast
      setTimeout(() => {
        navigate('/avaliadores')
      }, 2000)
      
    } catch (err) {
      console.error('Erro ao cadastrar avaliador:', err)
      setError(err.message || 'Erro ao cadastrar avaliador')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/avaliadores')
  }

  const showToast = (type, title, message) => {
    setToast({
      show: true,
      type,
      title,
      message
    })
  }

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  // Não precisa mais filtrar localmente, a busca já é feita no backend
  const filteredFuncionarios = funcionarios

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Cadastrar Avaliador</h2>
        <p>Selecione um funcionário e cadastre seu primeiro certificado para torná-lo um avaliador</p>
      </div>

      {success && (
        <div className="alert alert-success">
          <strong>Sucesso!</strong> Avaliador cadastrado com sucesso. Redirecionando...
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="form-container">
        <div className="form-layout">
          {/* Bloco Esquerdo - Seleção de Funcionário */}
          <div className="form-block left-block">
            <div className="block-header">
              <h3>1. Selecionar Funcionário</h3>
              <p>Escolha um funcionário ativo que ainda não possui certificados</p>
            </div>
            
            <div className="block-content">
              {/* Bloco Cinza - Funcionário Selecionado ou Estado Vazio */}
              {funcionarioSelecionado ? (
                <div className="selected-funcionario">
                  <h4>Funcionário Selecionado:</h4>
                  <div className="funcionario-card">
                    <div className="funcionario-info">
                      <h5>{funcionarioSelecionado.nome}</h5>
                      <p><strong>Email:</strong> {funcionarioSelecionado.email}</p>
                      <p><strong>Setor:</strong> {funcionarioSelecionado.setor}</p>
                      <p><strong>CPF:</strong> {funcionarioSelecionado.cpf}</p>
                    </div>
                    <button 
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setFuncionarioSelecionado(null)}
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

              {loadingFuncionarios ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Carregando funcionários...</p>
                </div>
              ) : (
                <div className="funcionarios-list">
                  {/* Barra de Busca - Movida para Cima */}
                  <div className="form-group search-section-top">
                    <label htmlFor="search-funcionario">Buscar Funcionário</label>
                    <div className="search-input-group">
                      <input
                        type="text"
                        id="search-funcionario"
                        placeholder="Digite o nome, email ou setor do funcionário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                      />
                      <span className="search-icon"><SearchIcon /></span>
                    </div>
                  </div>
                  
                  <h4>Funcionários Ativos Disponíveis ({filteredFuncionarios.length})</h4>
                  {filteredFuncionarios.length > 0 ? (
                    <div className="funcionarios-grid">
                      {filteredFuncionarios.map(funcionario => (
                        <div 
                          key={funcionario.cpf} 
                          className={`funcionario-item ${funcionarioSelecionado?.cpf === funcionario.cpf ? 'selected' : ''}`}
                          onClick={() => selecionarFuncionario(funcionario)}
                        >
                          <div className="funcionario-item-info">
                            <h5>{funcionario.nome}</h5>
                            <p><strong>Email:</strong> {funcionario.email}</p>
                            <p><strong>Setor:</strong> {funcionario.setor}</p>
                            <p><strong>CPF:</strong> {funcionario.cpf}</p>
                            <p><strong>Status:</strong> <span className={`badge ${funcionario.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>{funcionario.status}</span></p>
                          </div>
                          <div className="funcionario-item-actions">
                            {funcionarioSelecionado?.cpf === funcionario.cpf ? (
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
                      <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Não há funcionários ativos disponíveis para se tornarem avaliadores'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bloco Direito - Cadastro do Certificado */}
          <div className="form-block right-block">
            <div className="block-header">
              <h3>2. Cadastrar Certificado</h3>
              <p>Preencha as informações do primeiro certificado do funcionário</p>
            </div>
            
            <div className="block-content">
              {funcionarioSelecionado ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="treinamento_cod">Treinamento *</label>
                      <select
                        id="treinamento_cod"
                        name="treinamento_cod"
                        value={certificado.treinamento_cod}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="">Selecione um treinamento</option>
                        {treinamentos.map(treinamento => (
                          <option key={treinamento.cod_treinamento} value={treinamento.cod_treinamento}>
                            {treinamento.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="n_certificado">Número do Certificado *</label>
                      <input
                        type="text"
                        id="n_certificado"
                        name="n_certificado"
                        value={certificado.n_certificado}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Ex: CERT-2024-001"
                        required
                      />
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="form-actions">
                    <button 
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <XIcon /> Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-small"></div>
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <SaveIcon /> Cadastrar Avaliador
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="empty-state">
                  <UserIcon />
                  <h4>Selecione um funcionário</h4>
                  <p>Escolha um funcionário no painel à esquerda para cadastrar seu certificado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
          overflow-y: auto;
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
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
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

        .funcionarios-list {
          margin-top: 20px;
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

        .loading-state {
          padding: 40px 20px;
          text-align: center;
          color: #6b7280;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #e91e63;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .form-actions {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          gap: 15px;
          z-index: 10;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .alert {
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .alert-success {
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .alert-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
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
          
          .search-input-group {
            flex-direction: column;
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

      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={closeToast}
        duration={5000}
      />
    </div>
  )
}

export default CadastrarAvaliador
