import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

function AvaliadoresBarChart({ data }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

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
    if (!data || data.length === 0) return

    const { width, height } = dimensions

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll("*").remove()

    // Configurar dimensões
    const margin = { top: 20, right: 30, bottom: 100, left: 80 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Preparar dados: agrupar por avaliador
    const avaliadorMap = {}
    data.forEach(item => {
      const nome = item.avaliador_nome || item.nome || 'Sem nome'
      if (!avaliadorMap[nome]) {
        avaliadorMap[nome] = {
          nome: nome,
          total: 0
        }
      }
      avaliadorMap[nome].total += item.total_avaliacoes || item.total || 0
    })

    const processedData = Object.values(avaliadorMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 15) // Limitar a top 15 avaliadores

    // Criar escalas
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.nome))
      .range([0, innerWidth])
      .padding(0.2)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.total)])
      .nice()
      .range([innerHeight, 0])

    // Criar gradiente azul
    const gradient = d3.scaleSequential()
      .domain([0, d3.max(processedData, d => d.total)])
      .interpolator(d3.interpolateBlues)

    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Adicionar barras
    g.selectAll(".bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.nome))
      .attr("y", d => yScale(d.total))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.total))
      .attr("fill", d => gradient(d.total))
      .attr("rx", 4)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
        
        // Tooltip
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
          <strong>${d.nome}</strong><br/>
          Total: ${d.total} avaliações
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
      .data(processedData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d.nome) + xScale.bandwidth() / 2)
      .attr("y", d => {
        const barHeight = innerHeight - yScale(d.total)
        return barHeight > 25 
          ? yScale(d.total) + 15  // Dentro da barra
          : yScale(d.total) - 5   // Acima da barra
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("fill", d => {
        const barHeight = innerHeight - yScale(d.total)
        return barHeight > 25 ? "#ffffff" : "#333"
      })
      .text(d => d.total)

    // Adicionar eixos
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")

    g.append("g")
      .call(d3.axisLeft(yScale))

    // Adicionar labels dos eixos
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("Total de Avaliações")

  }, [data, dimensions])

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
        Avaliações por Avaliador
      </h3>
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflow: 'hidden' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', overflow: 'visible' }}></svg>
      </div>
    </div>
  )
}

export default AvaliadoresBarChart

