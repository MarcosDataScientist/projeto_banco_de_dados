import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Importar componentes das páginas
import Home from '../components/Home'
import Perguntas from '../components/Perguntas'
import Formularios from '../components/Formularios'
import Funcionarios from '../components/Funcionarios'
import Relatorios from '../components/Relatorios'
import Configuracoes from '../components/Configuracoes'
import NotFound from '../components/NotFound'

// Componente de layout que inclui a navbar
import Layout from '../components/Layout'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="perguntas" element={<Perguntas />} />
        <Route path="formularios" element={<Formularios />} />
        <Route path="funcionarios" element={<Funcionarios />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
