import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'

function SetorAvaliadoresChart({ data, setor }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Filtrar dados do setor selecionado
  const dadosSetor = useMemo(() => {
    if (!data || !setor) return []
    return data.filter(d => d.setor === setor)
      .sort((a, b) => b.total_avaliacoes - a.total_avaliacoes)
  }, [data, setor])

  // Obter dimensões do container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: Math.max(rect.width || 800, 400),
          height: Math.max(rect.height || 400, 300)
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!dadosSetor || dadosSetor.length === 0) return

    const { width, height } = dimensions

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll("*").remove()

    // Configurar dimensões
    const margin = { top: 20, right: 30, bottom: 60, left: 150 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Criar escalas
    const yScale = d3.scaleBand()
      .domain(dadosSetor.map(d => d.avaliador_nome))
      .range([0, innerHeight])
      .padding(0.2)

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(dadosSetor, d => d.total_avaliacoes || 0)])
      .nice()
      .range([0, innerWidth])

    // Paleta de cores consistente por avaliador
    const avaliadores = [...new Set(data.map(d => d.avaliador_cpf))]
    const colorScale = d3.scaleOrdinal()
      .domain(avaliadores)
      .range(d3.schemeCategory10)

    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Adicionar barras
    g.selectAll(".bar")
      .data(dadosSetor)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.avaliador_nome))
      .attr("x", 0)
      .attr("width", d => xScale(d.total_avaliacoes || 0))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.avaliador_cpf))
      .attr("rx", 4)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
        
        // Tooltip
        const totalSetor = d3.sum(dadosSetor.map(d => d.total_avaliacoes || 0))
        const percentual = ((d.total_avaliacoes || 0) / totalSetor * 100).toFixed(1)
        
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
        
        tooltip.transition()
          .duration(200)
          .style("opacity", 1)
        
        tooltip.html(`
          <strong>${d.avaliador_nome}</strong><br/>
          Avaliações: ${d.total_avaliacoes || 0}<br/>
          ${percentual}% do setor ${setor}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
        
        d3.selectAll(".tooltip").remove()
      })

    // Adicionar valores nas barras
    g.selectAll(".bar-label")
      .data(dadosSetor)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d.total_avaliacoes || 0) + 5)
      .attr("y", d => yScale(d.avaliador_nome) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .attr("fill", "#333")
      .text(d => d.total_avaliacoes || 0)

    // Adicionar eixos
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    g.append("g")
      .call(d3.axisLeft(yScale))

    // Adicionar labels dos eixos
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("Total de Avaliações")

  }, [dadosSetor, dimensions, data, setor])

  if (!setor) {
    return null
  }

  if (!dadosSetor || dadosSetor.length === 0) {
    return (
      <div className="chart-container">
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
          Contribuição dos Avaliadores - {setor}
        </h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Nenhum dado disponível para este setor
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
          Contribuição dos Avaliadores - {setor}
        </h3>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Limpar Seleção
        </button>
      </div>
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflow: 'hidden' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', overflow: 'visible' }}></svg>
      </div>
    </div>
  )
}

export default SetorAvaliadoresChart

