import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

function QuestionariosPieChart({ data, onQuestionarioClick }) {
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
    if (!data || data.length === 0) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove()
      }
      return
    }

    const { width, height } = dimensions

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll("*").remove()

    // Configurar dimensões - deixar espaço para legenda embaixo
    const margin = { top: 20, right: 20, bottom: 120, left: 20 } // Espaço embaixo para legenda
    const chartHeight = height - margin.top - margin.bottom
    const chartWidth = width - margin.left - margin.right
    const radius = Math.min(chartWidth, chartHeight) / 2 - 10
    const innerRadius = radius * 0.5 // Donut chart

    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    // Centralizar o gráfico no topo
    const chartCenterX = width / 2
    const chartCenterY = margin.top + radius + 10
    
    const g = svg.append("g")
      .attr("transform", `translate(${chartCenterX},${chartCenterY})`)

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
      .domain(data.map(d => d.questionario))
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
      .attr("fill", d => colorScale(d.data.questionario))
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
          <strong>${d.data.questionario}</strong><br/>
          Total: ${d.data.total || 0} avaliações<br/>
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
        if (onQuestionarioClick) {
          onQuestionarioClick(d.data.id)
        }
      })
      .style("cursor", onQuestionarioClick ? "pointer" : "default")

    // Adicionar legenda vertical abaixo do gráfico (centralizada)
    const legendY = chartCenterY + radius + 30 // Posição Y abaixo do gráfico
    const legendItemHeight = 25 // Altura de cada item
    const legendSpacing = 5 // Espaçamento entre itens
    
    // Calcular largura total da legenda para centralizar
    const legendWidth = 250 // Largura fixa para a legenda
    const legendX = (width - legendWidth) / 2 // Centralizar a legenda
    
    const legend = svg.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`)

    const legendItems = legend.selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => {
        return `translate(0, ${i * (legendItemHeight + legendSpacing)})`
      })
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        if (onQuestionarioClick) {
          onQuestionarioClick(d.id)
        }
      })

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => colorScale(d.questionario))
      .attr("rx", 2)
      .attr("y", 2)

    // Calcular percentual para cada item
    const total = d3.sum(data.map(d => d.total || 0))
    
    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("font-size", "12px")
      .attr("fill", "#333")
      .text(d => {
        const percentual = total > 0 ? ((d.total || 0) / total * 100).toFixed(1) : '0.0'
        return `${d.questionario} (${d.total || 0} - ${percentual}%)`
      })

  }, [data, dimensions, onQuestionarioClick])

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '450px' }}>
      {onQuestionarioClick && (
        <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 'normal', color: '#666' }}>
          (Clique em um questionário para ver detalhes)
        </div>
      )}
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflow: 'visible' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', overflow: 'visible' }}></svg>
      </div>
    </div>
  )
}

export default QuestionariosPieChart

