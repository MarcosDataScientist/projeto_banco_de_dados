import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import Home from './components/common/Home'
import Perguntas from './components/Perguntas/Perguntas'
import EditarPergunta from './components/Perguntas/EditarPergunta'
import Questionarios from './components/Questionarios/Questionarios'
import CadastrarQuestionario from './components/Questionarios/CadastrarQuestionario'
import EditarQuestionario from './components/Questionarios/EditarQuestionario'
import Funcionarios from './components/Funcionarios/Funcionarios'
import EditarFuncionario from './components/Funcionarios/EditarFuncionario'
import Avaliadores from './components/Avaliadores/Avaliadores'
import CadastrarAvaliador from './components/Avaliadores/CadastrarAvaliador'
import VisualizarAvaliador from './components/Avaliadores/VisualizarAvaliador'
import Avaliacao from './components/Avaliacao/Avaliacao'
import NovaAvaliacao from './components/Avaliacao/NovaAvaliacao'
import EditarAvaliacao from './components/Avaliacao/EditarAvaliacao'
import PreencherAvaliacao from './components/Avaliacao/PreencherAvaliacao'
import Relatorios from './components/Relatorios/Relatorios'
import Configuracoes from './components/Configuracoes/Configuracoes'
import NotFound from './components/common/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="perguntas" element={<Perguntas />} />
          <Route path="perguntas/editar/:id" element={<EditarPergunta />} />
          <Route path="questionarios" element={<Questionarios />} />
          <Route path="questionarios/novo" element={<CadastrarQuestionario />} />
          <Route path="questionarios/editar/:id" element={<EditarQuestionario />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="funcionarios/editar/:id" element={<EditarFuncionario />} />
          <Route path="avaliadores" element={<Avaliadores />} />
          <Route path="avaliadores/novo" element={<CadastrarAvaliador />} />
          <Route path="avaliadores/visualizar/:cpf" element={<VisualizarAvaliador />} />
          <Route path="avaliacoes/nova" element={<NovaAvaliacao />} />
          <Route path="avaliacoes/:id/editar" element={<EditarAvaliacao />} />
          <Route path="avaliacoes/:id/preencher" element={<PreencherAvaliacao />} />
          <Route path="avaliacoes" element={<Avaliacao />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

