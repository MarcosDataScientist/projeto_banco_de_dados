import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

function SetoresPieChart({ data, onSetorClick }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })

  // Obter dimensões do container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 600,
          height: rect.height || 400
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

    // Configurar dimensões - deixar espaço para legenda embaixo
    const chartHeight = height - 120 // Espaço para legenda
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const radius = Math.min(width - margin.left - margin.right, chartHeight - margin.top - margin.bottom) / 2 - 10
    const innerRadius = radius * 0.5 // Donut chart

    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${chartHeight / 2 + margin.top})`)

    // Preparar dados para pie chart
    const pie = d3.pie()
      .value(d => d.total || 0)
      .sort(null)

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)

    const arcHover = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10)

    // Paleta de cores
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.departamento))
      .range(d3.schemeCategory10)

    // Criar arcos
    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc")

    // Adicionar paths (fatias)
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.departamento))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("d", arcHover)
          .attr("opacity", 0.9)
        
        // Tooltip
        const total = d3.sum(data.map(d => d.total || 0))
        const percentual = ((d.data.total || 0) / total * 100).toFixed(1)
        
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
          <strong>${d.data.departamento}</strong><br/>
          Total: ${d.data.total || 0}<br/>
          ${percentual}% do total
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("d", arc)
          .attr("opacity", 1)
        
        d3.selectAll(".tooltip").remove()
      })
      .on("click", function(event, d) {
        if (onSetorClick) {
          onSetorClick(d.data.departamento)
        }
      })
      .style("cursor", onSetorClick ? "pointer" : "default")

    // Adicionar labels nas fatias
    // Criar arco externo para posicionar labels fora das fatias pequenas
    const arcLabel = d3.arc()
      .innerRadius(radius + 20)
      .outerRadius(radius + 20)

    // Adicionar labels com polylines para fatias pequenas
    arcs.each(function(d) {
      const centroid = arc.centroid(d)
      const total = d3.sum(data.map(d => d.total || 0))
      const percentual = ((d.data.total || 0) / total * 100).toFixed(1)
      const isSmallSlice = percentual < 5
      
      if (isSmallSlice) {
        // Para fatias pequenas: usar polyline para conectar label à fatia
        const outerArc = d3.arc()
          .innerRadius(radius + 10)
          .outerRadius(radius + 10)
        
        const outerCentroid = outerArc.centroid(d)
        const labelX = outerCentroid[0] * 1.5
        const labelY = outerCentroid[1] * 1.5
        
        // Adicionar linha conectora
        const g = d3.select(this)
        g.append("polyline")
          .attr("points", `${outerCentroid[0]},${outerCentroid[1]} ${labelX},${labelY}`)
          .attr("fill", "none")
          .attr("stroke", "#666")
          .attr("stroke-width", 1)
          .attr("opacity", 0.5)
        
        // Adicionar label fora
        g.append("text")
          .attr("transform", `translate(${labelX},${labelY})`)
          .attr("dy", "0.35em")
          .attr("text-anchor", labelX > 0 ? "start" : "end")
          .attr("font-size", "11px")
          .attr("font-weight", "500")
          .attr("fill", "#333")
          .text(`${d.data.departamento} (${percentual}%)`)
      } else {
        // Para fatias grandes: label dentro da fatia
        const g = d3.select(this)
        g.append("text")
          .attr("transform", `translate(${centroid[0]},${centroid[1]})`)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", "#333")
          .text(`${d.data.departamento}`)
        
        // Adicionar percentual abaixo do nome
        g.append("text")
          .attr("transform", `translate(${centroid[0]},${centroid[1] + 15})`)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("font-weight", "500")
          .attr("fill", "#666")
          .text(`${percentual}%`)
      }
    })

    // Adicionar legenda embaixo do gráfico
    const legendY = chartHeight + margin.top + 20
    const legendItemWidth = width / Math.min(data.length, 4) // Máximo 4 itens por linha
    const itemsPerRow = Math.min(data.length, 4)
    
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${legendY})`)

    const legendItems = legend.selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => {
        const row = Math.floor(i / itemsPerRow)
        const col = i % itemsPerRow
        return `translate(${col * legendItemWidth}, ${row * 25})`
      })
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        if (onSetorClick) {
          onSetorClick(d.departamento)
        }
      })

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => colorScale(d.departamento))
      .attr("rx", 2)

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#333")
      .text(d => {
        const maxLength = Math.floor(legendItemWidth / 8) // Ajustar comprimento baseado na largura disponível
        const nome = d.departamento.length > maxLength 
          ? d.departamento.substring(0, maxLength) + '...' 
          : d.departamento
        return `${nome} (${d.total || 0})`
      })

  }, [data, dimensions, onSetorClick])

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '450px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
        Avaliações por Setor
        {onSetorClick && <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>(Clique em um setor para ver detalhes)</span>}
      </h3>
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflow: 'visible' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', overflow: 'visible' }}></svg>
      </div>
    </div>
  )
}

export default SetoresPieChart

