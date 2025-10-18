import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import Perguntas from './components/Perguntas'
import EditarPergunta from './components/EditarPergunta'
import Formularios from './components/Formularios'
import Funcionarios from './components/Funcionarios'
import EditarFuncionario from './components/EditarFuncionario'
import Avaliadores from './components/Avaliadores'
import Avaliacao from './components/Avaliacao'
import Relatorios from './components/Relatorios'
import Configuracoes from './components/Configuracoes'
import NotFound from './components/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="perguntas" element={<Perguntas />} />
          <Route path="perguntas/editar/:id" element={<EditarPergunta />} />
          <Route path="formularios" element={<Formularios />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="funcionarios/editar/:id" element={<EditarFuncionario />} />
          <Route path="avaliadores" element={<Avaliadores />} />
          <Route path="avaliacao" element={<Avaliacao />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

