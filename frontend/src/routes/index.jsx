import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Importar componentes das páginas
import Home from '../components/common/Home'
import Perguntas from '../components/Perguntas/Perguntas'
import Questionarios from '../components/Questionarios/Questionarios'
import CadastrarQuestionario from '../components/Questionarios/CadastrarQuestionario'
import EditarQuestionario from '../components/Questionarios/EditarQuestionario'
import Funcionarios from '../components/Funcionarios/Funcionarios'
import Avaliacao from '../components/Avaliacao/Avaliacao'
import NovaAvaliacao from '../components/Avaliacao/NovaAvaliacao'
import Configuracao from '../components/Configuracao/Configuracao'
import NotFound from '../components/common/NotFound'

// Componente de layout que inclui a navbar
import Layout from '../components/common/Layout'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="perguntas" element={<Perguntas />} />
        <Route path="questionarios" element={<Questionarios />} />
        <Route path="questionarios/novo" element={<CadastrarQuestionario />} />
        <Route path="questionarios/editar/:id" element={<EditarQuestionario />} />
        <Route path="funcionarios" element={<Funcionarios />} />
        <Route path="avaliacoes" element={<Avaliacao />} />
        <Route path="avaliacoes/nova" element={<NovaAvaliacao />} />
        <Route path="configuracao" element={<Configuracao />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
