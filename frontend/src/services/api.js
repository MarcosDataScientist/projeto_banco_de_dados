/**
 * Serviço de API para comunicação com o backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        const error = new Error(data.error || 'Erro na requisição')
        error.response = { status: response.status, data }
        throw error
      }

      return data
    } catch (error) {
      console.error(`Erro ao fazer requisição para ${endpoint}:`, error)
      throw error
    }
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  async getEstatisticas() {
    return this.request('/dashboard/estatisticas')
  }

  async getAvaliacoesPorMes(meses = 6) {
    return this.request(`/dashboard/avaliacoes-mes?meses=${meses}`)
  }

  async getMotivosSaida() {
    return this.request('/dashboard/motivos-saida')
  }

  async getStatusAvaliacoes() {
    return this.request('/dashboard/status-avaliacoes')
  }

  async getAtividadesRecentes(limite = 10) {
    return this.request(`/dashboard/atividades-recentes?limite=${limite}`)
  }

  // ==========================================
  // FUNCIONÁRIOS
  // ==========================================

  async getFuncionarios(status = null, departamento = null, page = 1, per_page = 20, busca = null) {
    let query = ''
    const params = []
    
    if (status) {
      params.push(`status=${encodeURIComponent(status)}`)
    }
    if (departamento) {
      params.push(`departamento=${encodeURIComponent(departamento)}`)
    }
    if (page) {
      params.push(`page=${encodeURIComponent(page)}`)
    }
    if (per_page) {
      params.push(`per_page=${encodeURIComponent(per_page)}`)
    }
    if (busca) {
      params.push(`q=${encodeURIComponent(busca)}`)
    }
    
    if (params.length > 0) {
      query = '?' + params.join('&')
    }
    
    return this.request(`/funcionarios${query}`)
  }

  async getFuncionario(cpf) {
    // cpf pode vir com ou sem formatação
    const cpfLimpo = cpf.replace(/\D/g, '')
    return this.request(`/funcionarios/${cpfLimpo}`)
  }

  async criarFuncionario(dados) {
    return this.request('/funcionarios', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  async cadastrarFuncionario(dados) {
    return this.criarFuncionario(dados)
  }

  async atualizarFuncionario(cpf, dados) {
    // cpf pode vir com ou sem formatação
    const cpfLimpo = cpf.replace(/\D/g, '')
    return this.request(`/funcionarios/${cpfLimpo}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }

  async deletarFuncionario(cpf) {
    // cpf pode vir com ou sem formatação
    const cpfLimpo = cpf.replace(/\D/g, '')
    return this.request(`/funcionarios/${cpfLimpo}`, {
      method: 'DELETE',
    })
  }

  async getDepartamentos() {
    return this.request('/departamentos')
  }

  async getTotalFuncionarios() {
    return this.request('/funcionarios/total')
  }

  async getEstatisticasFuncionarios() {
    return this.request('/funcionarios/estatisticas')
  }

  // ==========================================
  // PERGUNTAS
  // ==========================================

  async getPerguntas(categoria = null, ativa = null, page = 1, per_page = 10, busca = null, tipo = null) {
    let query = ''
    const params = []
    
    if (categoria) {
      params.push(`categoria=${categoria}`)
    }
    if (ativa !== null) {
      params.push(`ativa=${ativa}`)
    }
    if (page) {
      params.push(`page=${page}`)
    }
    if (per_page) {
      params.push(`per_page=${per_page}`)
    }
    if (busca) {
      params.push(`q=${encodeURIComponent(busca)}`)
    }
    if (tipo && tipo !== 'Todos') {
      params.push(`tipo=${encodeURIComponent(tipo)}`)
    }
    
    if (params.length > 0) {
      query = '?' + params.join('&')
    }
    
    const response = this.request(`/perguntas${query}`)
    // Retornar resposta completa com paginação se disponível
    return response.then(data => {
      // Se tem estrutura de paginação, retornar completo
      if (data.perguntas && data.pagination) {
        return data
      }
      // Caso contrário, retornar apenas o array
      return data
    })
  }

  async getPergunta(id) {
    return this.request(`/perguntas/${id}`)
  }

  async criarPergunta(dados) {
    return this.request('/perguntas', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  async atualizarPergunta(id, dados) {
    return this.request(`/perguntas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }

  async deletarPergunta(id) {
    return this.request(`/perguntas/${id}`, {
      method: 'DELETE',
    })
  }

  async getCategorias() {
    return this.request('/categorias')
  }

  // ==========================================
  // AVALIAÇÕES
  // ==========================================

  async getAvaliacoes(status = null, funcionario = null) {
    let query = ''
    if (status) query += `?status=${status}`
    if (funcionario) query += `${query ? '&' : '?'}funcionario=${funcionario}`
    return this.request(`/avaliacoes${query}`)
  }

  async getAvaliacao(id) {
    return this.request(`/avaliacoes/${id}`)
  }

  async criarAvaliacao(dados) {
    return this.request('/avaliacoes', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  async atualizarStatusAvaliacao(id, dados) {
    return this.request(`/avaliacoes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }

  async atualizarAvaliacao(id, dados) {
    return this.request(`/avaliacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }

  async salvarRespostaAvaliacao(dados) {
    return this.request('/avaliacoes/respostas', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  async getRespostasAvaliacao(avaliacaoId) {
    return this.request(`/avaliacoes/${avaliacaoId}`)
  }

  async deletarAvaliacao(id) {
    return this.request(`/avaliacoes/${id}`, {
      method: 'DELETE',
    })
  }

  // ==========================================
  // QUESTIONÁRIOS (FORMULÁRIOS)
  // ==========================================

  async getQuestionarios() {
    return this.request('/questionarios')
  }

  async getQuestionario(id) {
    return this.request(`/questionarios/${id}`)
  }

  async criarQuestionario(dados) {
    return this.request('/questionarios', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  async atualizarQuestionario(id, dados) {
    return this.request(`/questionarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }

  async deletarQuestionario(id) {
    return this.request(`/questionarios/${id}`, {
      method: 'DELETE',
    })
  }

  async getClassificacoes() {
    return this.request('/classificacoes')
  }

  // Avaliadores
  async getAvaliadores() {
    return this.request('/avaliadores')
  }

  async getAvaliador(cpf) {
    return this.request(`/avaliadores/${cpf}`)
  }

  async getCertificadosAvaliador(cpf) {
    return this.request(`/avaliadores/${cpf}/certificados`)
  }

  // Treinamentos
  async getTreinamentos() {
    return this.request('/treinamentos')
  }

  // Vínculo Funcionário-Treinamento
  async criarVinculoFuncionarioTreinamento(dados) {
    return this.request('/funcionario-treinamento', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }

  async atualizarVinculoFuncionarioTreinamento(dados) {
    return this.request('/funcionario-treinamento', {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }

  async deletarVinculoFuncionarioTreinamento(funcionario_cpf, treinamento_cod) {
    return this.request(`/funcionario-treinamento?funcionario_cpf=${funcionario_cpf}&treinamento_cod=${treinamento_cod}`, {
      method: 'DELETE',
    })
  }

  // ==========================================
  // ADMINISTRAÇÃO
  // ==========================================

  async limparBancoDados() {
    return this.request('/admin/limpar-banco', {
      method: 'DELETE',
    })
  }
}

export default new ApiService()

