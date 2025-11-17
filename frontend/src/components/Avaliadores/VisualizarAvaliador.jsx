import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SaveIcon, XIcon, UserIcon, PlusIcon, EditIcon, DeleteIcon, CertificateIcon, ArrowLeftIcon } from '../common/Icons'
import Toast from '../common/Toast'
import ConfirmModal from '../common/ConfirmModal'
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
  
  // Estado do modal de adicionar certificado
  const [showModalCertificado, setShowModalCertificado] = useState(false)
  const [novoCertificado, setNovoCertificado] = useState({
    treinamento_cod: '',
    n_certificado: ''
  })
  const [treinamentos, setTreinamentos] = useState([])
  const [salvandoCertificado, setSalvandoCertificado] = useState(false)
  
  // Estado do modal de editar certificado
  const [showModalEditarCertificado, setShowModalEditarCertificado] = useState(false)
  const [certificadoEditando, setCertificadoEditando] = useState(null)
  const [certificadoEditado, setCertificadoEditado] = useState({
    n_certificado: ''
  })
  
  // Estado do modal de confirmar exclusão
  const [showModalExcluir, setShowModalExcluir] = useState(false)
  const [certificadoExcluir, setCertificadoExcluir] = useState(null)
  
  // Estado do Toast
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    carregarDados()
    carregarTreinamentos()
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
      
      // Se não houver certificados, a pessoa não é mais um avaliador
      if (!dadosCertificados || dadosCertificados.length === 0) {
        showToast(
          'info',
          'Avaliador não encontrado',
          'Este funcionário não possui treinamentos e não é um avaliador.'
        )
        setTimeout(() => {
          navigate('/avaliadores')
        }, 2000)
      }
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do avaliador. Tente novamente.')
      // Se houver erro ao buscar, pode ser que não seja mais um avaliador
      setTimeout(() => {
        navigate('/avaliadores')
      }, 3000)
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

  const carregarTreinamentos = async () => {
    try {
      const dados = await api.getTreinamentos()
      setTreinamentos(dados)
    } catch (err) {
      console.error('Erro ao carregar treinamentos:', err)
    }
  }

  const handleInputChangeCertificado = (e) => {
    const { name, value } = e.target
    setNovoCertificado(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAbrirModalCertificado = () => {
    setNovoCertificado({
      treinamento_cod: '',
      n_certificado: ''
    })
    setShowModalCertificado(true)
  }

  const handleFecharModalCertificado = () => {
    setShowModalCertificado(false)
    setNovoCertificado({
      treinamento_cod: '',
      n_certificado: ''
    })
  }

  const handleAdicionarCertificado = async (e) => {
    e.preventDefault()
    
    if (!novoCertificado.treinamento_cod || !novoCertificado.n_certificado) {
      showToast(
        'error',
        'Campos obrigatórios',
        'Preencha o treinamento e o número do certificado'
      )
      return
    }

    try {
      setSalvandoCertificado(true)
      
      const dadosVinculo = {
        funcionario_cpf: cpf,
        treinamento_cod: parseInt(novoCertificado.treinamento_cod),
        n_certificado: novoCertificado.n_certificado
      }
      
      await api.criarVinculoFuncionarioTreinamento(dadosVinculo)
      
      // Recarregar certificados
      const dadosCertificados = await api.getCertificadosAvaliador(cpf)
      setCertificados(dadosCertificados)
      
      showToast(
        'success',
        'Certificado adicionado!',
        'O certificado foi adicionado com sucesso ao avaliador.'
      )
      
      handleFecharModalCertificado()
      
    } catch (err) {
      console.error('Erro ao adicionar certificado:', err)
      showToast(
        'error',
        'Erro ao adicionar certificado',
        err.message || 'Não foi possível adicionar o certificado. Tente novamente.'
      )
    } finally {
      setSalvandoCertificado(false)
    }
  }

  const handleEditarCertificado = (certificado) => {
    setCertificadoEditando(certificado)
    setCertificadoEditado({
      n_certificado: certificado.n_certificado || ''
    })
    setShowModalEditarCertificado(true)
  }

  const handleFecharModalEditar = () => {
    setShowModalEditarCertificado(false)
    setCertificadoEditando(null)
    setCertificadoEditado({ n_certificado: '' })
  }

  const handleSalvarEdicaoCertificado = async (e) => {
    e.preventDefault()
    
    if (!certificadoEditado.n_certificado) {
      showToast(
        'error',
        'Campo obrigatório',
        'O número do certificado é obrigatório'
      )
      return
    }

    try {
      setSalvandoCertificado(true)
      
      const dadosAtualizacao = {
        funcionario_cpf: cpf,
        treinamento_cod: certificadoEditando.cod_treinamento,
        n_certificado: certificadoEditado.n_certificado
      }
      
      await api.atualizarVinculoFuncionarioTreinamento(dadosAtualizacao)
      
      // Recarregar certificados
      const dadosCertificados = await api.getCertificadosAvaliador(cpf)
      setCertificados(dadosCertificados)
      
      showToast(
        'success',
        'Certificado atualizado!',
        'O certificado foi atualizado com sucesso.'
      )
      
      handleFecharModalEditar()
      
    } catch (err) {
      console.error('Erro ao atualizar certificado:', err)
      showToast(
        'error',
        'Erro ao atualizar certificado',
        err.message || 'Não foi possível atualizar o certificado. Tente novamente.'
      )
    } finally {
      setSalvandoCertificado(false)
    }
  }

  const handleExcluirCertificado = (certificado) => {
    setCertificadoExcluir(certificado)
    setShowModalExcluir(true)
  }

  const handleConfirmarExclusao = async () => {
    if (!certificadoExcluir) return

    try {
      setSalvandoCertificado(true)
      
      await api.deletarVinculoFuncionarioTreinamento(cpf, certificadoExcluir.cod_treinamento)
      
      // Recarregar certificados
      const dadosCertificados = await api.getCertificadosAvaliador(cpf)
      setCertificados(dadosCertificados)
      
      // Verificar se ainda há certificados
      if (!dadosCertificados || dadosCertificados.length === 0) {
        // Não há mais certificados, a pessoa não é mais um avaliador
        showToast(
          'info',
          'Avaliador removido',
          'Este funcionário não possui mais treinamentos e não é mais um avaliador.'
        )
        
        // Aguardar um pouco para mostrar o toast e depois redirecionar
        setTimeout(() => {
          navigate('/avaliadores')
        }, 2000)
      } else {
        showToast(
          'success',
          'Certificado excluído!',
          'O certificado foi excluído com sucesso.'
        )
      }
      
      setShowModalExcluir(false)
      setCertificadoExcluir(null)
      
    } catch (err) {
      console.error('Erro ao excluir certificado:', err)
      showToast(
        'error',
        'Erro ao excluir certificado',
        err.message || 'Não foi possível excluir o certificado. Tente novamente.'
      )
    } finally {
      setSalvandoCertificado(false)
    }
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
        <h2>Visualizar Avaliador</h2>
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
          <div style={{ marginTop: '20px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/avaliadores')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ArrowLeftIcon /> Voltar
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="list-container">
          {/* Dados Pessoais - Apenas Visualização */}
          <div className="form-card">
            <h3>Dados Pessoais</h3>
            <div className="data-display">
              <div className="data-row">
                <div className="data-item">
                  <span className="data-label">Nome Completo</span>
                  <span className="data-value">{avaliador.nome || 'N/A'}</span>
                </div>
                
                <div className="data-item">
                  <span className="data-label">CPF</span>
                  <span className="data-value">{avaliador.cpf || 'N/A'}</span>
                </div>
              </div>

              <div className="data-row">
                <div className="data-item">
                  <span className="data-label">E-mail</span>
                  <span className="data-value">{avaliador.email || 'N/A'}</span>
                </div>
                
                <div className="data-item">
                  <span className="data-label">Setor</span>
                  <span className="data-value">{avaliador.setor || 'N/A'}</span>
                </div>
              </div>

              <div className="data-row">
                <div className="data-item">
                  <span className="data-label">Status</span>
                  <span className={`badge ${avaliador.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>
                    {avaliador.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Certificados */}
          <div className="form-card">
            <div className="card-header">
              <h3>Certificados do Avaliador</h3>
              <button className="btn-primary btn-sm" onClick={handleAbrirModalCertificado}>
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
                      </div>
                    </div>
                    <div className="certificado-actions">
                      <button 
                        className="btn-action btn-edit" 
                        title="Editar certificado"
                        onClick={() => handleEditarCertificado(cert)}
                        disabled={salvandoCertificado}
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        title="Excluir certificado"
                        onClick={() => handleExcluirCertificado(cert)}
                        disabled={salvandoCertificado}
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

      {/* Modal de Adicionar Certificado */}
      {showModalCertificado && (
        <div className="modal-overlay" onClick={handleFecharModalCertificado}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Novo Certificado</h3>
              <button 
                className="modal-close" 
                onClick={handleFecharModalCertificado}
                disabled={salvandoCertificado}
              >
                <XIcon />
              </button>
            </div>
            
            <form onSubmit={handleAdicionarCertificado}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="treinamento_cod">Treinamento *</label>
                  <select
                    id="treinamento_cod"
                    name="treinamento_cod"
                    value={novoCertificado.treinamento_cod}
                    onChange={handleInputChangeCertificado}
                    className="form-input"
                    required
                    disabled={salvandoCertificado}
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
                    value={novoCertificado.n_certificado}
                    onChange={handleInputChangeCertificado}
                    className="form-input"
                    placeholder="Ex: CERT-2024-001"
                    required
                    disabled={salvandoCertificado}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleFecharModalCertificado}
                  disabled={salvandoCertificado}
                >
                  <XIcon /> Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={salvandoCertificado}
                >
                  {salvandoCertificado ? (
                    <>
                      <div className="spinner-small"></div>
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <SaveIcon /> Adicionar Certificado
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Certificado */}
      {showModalEditarCertificado && certificadoEditando && (
        <div className="modal-overlay" onClick={handleFecharModalEditar}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Certificado</h3>
              <button 
                className="modal-close" 
                onClick={handleFecharModalEditar}
                disabled={salvandoCertificado}
              >
                <XIcon />
              </button>
            </div>
            
            <form onSubmit={handleSalvarEdicaoCertificado}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="treinamento_edit">Treinamento</label>
                  <input
                    type="text"
                    id="treinamento_edit"
                    value={certificadoEditando.nome_treinamento}
                    className="form-input"
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="n_certificado_edit">Número do Certificado *</label>
                  <input
                    type="text"
                    id="n_certificado_edit"
                    name="n_certificado"
                    value={certificadoEditado.n_certificado}
                    onChange={(e) => setCertificadoEditado({ ...certificadoEditado, n_certificado: e.target.value })}
                    className="form-input"
                    placeholder="Ex: CERT-2024-001"
                    required
                    disabled={salvandoCertificado}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleFecharModalEditar}
                  disabled={salvandoCertificado}
                >
                  <XIcon /> Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={salvandoCertificado}
                >
                  {salvandoCertificado ? (
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
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Exclusão */}
      <ConfirmModal
        isOpen={showModalExcluir}
        title="Excluir Certificado"
        message={`Tem certeza que deseja excluir o certificado "${certificadoExcluir?.nome_treinamento}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmarExclusao}
        onClose={() => {
          setShowModalExcluir(false)
          setCertificadoExcluir(null)
        }}
      />

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

        .btn-action {
          background: #f8f8f8;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-action svg {
          width: 16px;
          height: 16px;
        }

        .btn-action:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-edit:hover:not(:disabled) {
          background: #4caf50;
          border-color: #388e3c;
          color: white;
        }

        .btn-delete:hover:not(:disabled) {
          background: #f44336;
          border-color: #d32f2f;
          color: white;
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

        .data-display {
          padding: 20px 0;
        }

        .data-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .data-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .data-label {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-value {
          font-size: 16px;
          color: #1f2937;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .form-row,
          .data-row {
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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #1f2937;
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 30px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VisualizarAvaliador

