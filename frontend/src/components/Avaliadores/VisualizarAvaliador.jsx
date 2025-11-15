import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SaveIcon, XIcon, UserIcon, PlusIcon, EditIcon, DeleteIcon, CertificateIcon } from '../common/Icons'
import Toast from '../common/Toast'
import api from '../../services/api'

function VisualizarAvaliador() {
  const navigate = useNavigate()
  const { cpf } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Dados do avaliador
  const [avaliador, setAvaliador] = useState(null)
  const [certificados, setCertificados] = useState([])
  
  // Estado do Toast
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    carregarDados()
  }, [cpf])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar dados do avaliador
      const dadosAvaliador = await api.getAvaliador(cpf)
      setAvaliador(dadosAvaliador)
      
      // Carregar certificados do avaliador
      const dadosCertificados = await api.getCertificadosAvaliador(cpf)
      setCertificados(dadosCertificados)
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do avaliador. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAvaliador(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Atualizar dados do avaliador
      await api.atualizarFuncionario(cpf, {
        nome: avaliador.nome,
        email: avaliador.email,
        setor: avaliador.setor,
        status: avaliador.status
      })
      
      // Mostrar Toast de sucesso
      showToast(
        'success',
        'Avaliador atualizado com sucesso!',
        `Os dados de ${avaliador.nome} foram atualizados.`
      )
      
      setIsEditing(false)
      
    } catch (err) {
      console.error('Erro ao atualizar avaliador:', err)
      showToast(
        'error',
        'Erro ao atualizar avaliador',
        err.message || 'Não foi possível atualizar os dados. Tente novamente.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      carregarDados() // Recarregar dados originais
      setIsEditing(false)
    } else {
      navigate('/avaliadores')
    }
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

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A'
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Visualizar Avaliador</h2>
        </div>
        <div className="empty-state">
          <p>Carregando dados do avaliador...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Visualizar Avaliador</h2>
        </div>
        <div className="empty-state">
          <p style={{ color: 'red' }}>{error}</p>
          <button className="btn-primary" onClick={carregarDados}>
            Tentar novamente
          </button>
          <button className="btn-secondary" onClick={() => navigate('/avaliadores')}>
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (!avaliador) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Visualizar Avaliador</h2>
        </div>
        <div className="empty-state">
          <p>Avaliador não encontrado</p>
          <button className="btn-secondary" onClick={() => navigate('/avaliadores')}>
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{isEditing ? 'Editar Avaliador' : 'Visualizar Avaliador'}</h2>
      </div>

      <div className="dashboard-layout">
        {/* Informações do Avaliador */}
        <div className="stats-sidebar">
          <div className="stats-box">
            <h3>Resumo</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total de Certificados</span>
                <span className="stat-number">{certificados.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Treinamentos Únicos</span>
                <span className="stat-number">{new Set(certificados.map(c => c.nome_treinamento)).size}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Status</span>
                <span className={`badge ${avaliador.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>
                  {avaliador.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="list-container">
          {/* Formulário de Edição */}
          <div className="form-card">
            <h3>Dados Pessoais</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={avaliador.nome}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={avaliador.cpf}
                    className="form-input"
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">E-mail *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={avaliador.email}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="setor">Setor *</label>
                  <input
                    type="text"
                    id="setor"
                    name="setor"
                    value={avaliador.setor}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={avaliador.status}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={!isEditing}
                    required
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <XIcon /> Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="spinner-small"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <SaveIcon /> Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              )}

              {!isEditing && (
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <EditIcon /> Editar Dados
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Lista de Certificados */}
          <div className="form-card">
            <div className="card-header">
              <h3>Certificados do Avaliador</h3>
              <button className="btn-primary btn-sm" onClick={() => navigate(`/avaliadores/visualizar/${cpf}/novo-certificado`)}>
                <PlusIcon /> Adicionar Certificado
              </button>
            </div>

            {certificados.length === 0 ? (
              <div className="empty-state-small">
                <CertificateIcon />
                <p>Nenhum certificado cadastrado</p>
              </div>
            ) : (
              <div className="certificados-list">
                {certificados.map((cert, index) => (
                  <div key={index} className="certificado-item">
                    <div className="certificado-main">
                      <div className="certificado-icon">
                        <CertificateIcon />
                      </div>
                      <div className="certificado-info">
                        <h4>{cert.nome_treinamento}</h4>
                        <p><strong>Certificado:</strong> {cert.n_certificado}</p>
                        <div className="certificado-datas">
                          <span>📅 Realização: {formatarData(cert.data_realizacao)}</span>
                          <span>⏰ Validade: {formatarData(cert.validade)}</span>
                        </div>
                        {cert.local && <p><strong>Local:</strong> {cert.local}</p>}
                      </div>
                    </div>
                    <div className="certificado-actions">
                      <button 
                        className="btn-action btn-edit" 
                        title="Editar certificado"
                        onClick={() => console.log('Editar certificado', cert)}
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        title="Excluir certificado"
                        onClick={() => console.log('Excluir certificado', cert)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão flutuante de voltar no canto inferior direito */}
      <div className="floating-actions">
        <button className="btn-secondary" onClick={() => navigate('/avaliadores')}>
          <XIcon /> Voltar
        </button>
      </div>

      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={closeToast}
        duration={5000}
      />

      <style jsx="true">{`
        .floating-actions {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          gap: 12px;
          z-index: 1000;
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .form-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px 0;
          padding-bottom: 15px;
          border-bottom: 2px solid #e91e63;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          margin: 0;
          padding: 0;
          border: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #e91e63;
          box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
        }

        .form-input:disabled {
          background-color: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .empty-state-small {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .empty-state-small svg {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .certificados-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .certificado-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .certificado-item:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .certificado-main {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          flex: 1;
        }

        .certificado-icon {
          width: 48px;
          height: 48px;
          background: #e91e63;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .certificado-icon svg {
          width: 24px;
          height: 24px;
        }

        .certificado-info {
          flex: 1;
        }

        .certificado-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .certificado-info p {
          font-size: 14px;
          color: #6b7280;
          margin: 4px 0;
        }

        .certificado-datas {
          display: flex;
          gap: 20px;
          margin-top: 8px;
        }

        .certificado-datas span {
          font-size: 13px;
          color: #6b7280;
        }

        .certificado-actions {
          display: flex;
          gap: 8px;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .badge-ativo {
          background-color: #d1fae5;
          color: #065f46;
        }

        .badge-inativo {
          background-color: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .certificado-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .certificado-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 12px;
          }

          .floating-actions {
            bottom: 20px;
            right: 20px;
            flex-direction: column;
          }

          .floating-actions button {
            width: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default VisualizarAvaliador

