import React, { useState } from 'react'
import { SettingsIcon } from '../common/Icons'

function Configuracoes() {
  const [configuracoes, setConfiguracoes] = useState({
    notificacoes: {
      emailAvaliacao: true,
      emailRelatorio: false,
      lembreteFormulario: true
    },
    sistema: {
      tempoExpiracao: 30,
      backupAutomatico: true,
      tema: 'claro'
    },
    empresa: {
      nome: 'SADEF - Sistema de Avaliação',
      logo: '',
      emailContato: 'rh@empresa.com'
    }
  })

  const handleConfigChange = (categoria, campo, valor) => {
    setConfiguracoes(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [campo]: valor
      }
    }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Configurações</h2>
        <p>Configure as preferências e parâmetros do sistema</p>
      </div>

      <div className="config-sections">
        <div className="config-section">
          <h3>Notificações</h3>
          <div className="config-options">
            <div className="config-option">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={configuracoes.notificacoes.emailAvaliacao}
                  onChange={(e) => handleConfigChange('notificacoes', 'emailAvaliacao', e.target.checked)}
                />
                <span className="config-text">Enviar email quando avaliação for concluída</span>
              </label>
            </div>
            <div className="config-option">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={configuracoes.notificacoes.emailRelatorio}
                  onChange={(e) => handleConfigChange('notificacoes', 'emailRelatorio', e.target.checked)}
                />
                <span className="config-text">Enviar email quando relatório for gerado</span>
              </label>
            </div>
            <div className="config-option">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={configuracoes.notificacoes.lembreteFormulario}
                  onChange={(e) => handleConfigChange('notificacoes', 'lembreteFormulario', e.target.checked)}
                />
                <span className="config-text">Enviar lembrete para formulários pendentes</span>
              </label>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Sistema</h3>
          <div className="config-options">
            <div className="config-option">
              <label className="config-label">
                <span className="config-text">Tempo de expiração do formulário (dias):</span>
                <input
                  type="number"
                  value={configuracoes.sistema.tempoExpiracao}
                  onChange={(e) => handleConfigChange('sistema', 'tempoExpiracao', parseInt(e.target.value))}
                  className="config-input"
                  min="1"
                  max="90"
                />
              </label>
            </div>
            <div className="config-option">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={configuracoes.sistema.backupAutomatico}
                  onChange={(e) => handleConfigChange('sistema', 'backupAutomatico', e.target.checked)}
                />
                <span className="config-text">Backup automático dos dados</span>
              </label>
            </div>
            <div className="config-option">
              <label className="config-label">
                <span className="config-text">Tema do sistema:</span>
                <select
                  value={configuracoes.sistema.tema}
                  onChange={(e) => handleConfigChange('sistema', 'tema', e.target.value)}
                  className="config-select"
                >
                  <option value="claro">Claro</option>
                  <option value="escuro">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Empresa</h3>
          <div className="config-options">
            <div className="config-option">
              <label className="config-label">
                <span className="config-text">Nome da empresa:</span>
                <input
                  type="text"
                  value={configuracoes.empresa.nome}
                  onChange={(e) => handleConfigChange('empresa', 'nome', e.target.value)}
                  className="config-input"
                />
              </label>
            </div>
            <div className="config-option">
              <label className="config-label">
                <span className="config-text">Email de contato:</span>
                <input
                  type="email"
                  value={configuracoes.empresa.emailContato}
                  onChange={(e) => handleConfigChange('empresa', 'emailContato', e.target.value)}
                  className="config-input"
                />
              </label>
            </div>
            <div className="config-option">
              <label className="config-label">
                <span className="config-text">Logo da empresa:</span>
                <input
                  type="file"
                  accept="image/*"
                  className="config-file"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="config-actions">
        <button className="btn-primary">
          <SettingsIcon /> Salvar Configurações
        </button>
        <button className="btn-secondary">
          Restaurar Padrões
        </button>
      </div>
    </div>
  )
}

export default Configuracoes
