import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

function PontosTemporalLineChart({ data }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Obter dimensões do container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 800,
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

    console.log('PontosTemporalLineChart - Dados recebidos:', data)
    console.log('PontosTemporalLineChart - Tipo:', typeof data, Array.isArray(data))

    const { width, height } = dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 80 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Limpar SVG anterior
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove()
    }

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Processar dados
    const dadosProcessados = data.map(d => {
      // Tentar diferentes formatos de data
      let dataObj = null
      if (d.data) {
        if (typeof d.data === 'string') {
          dataObj = new Date(d.data)
        } else if (d.data instanceof Date) {
          dataObj = d.data
        } else {
          // Tentar parsear como string
          dataObj = new Date(String(d.data))
        }
      }
      
      if (!dataObj || isNaN(dataObj.getTime())) {
        console.warn('Data inválida:', d.data)
        return null
      }
      
      const totalPontos = Number(d.total_pontos) || 0
      const totalAvaliacoes = Number(d.total_avaliacoes) || 0
      const media = totalAvaliacoes > 0 ? totalPontos / totalAvaliacoes : 0
      
      return {
        data: dataObj,
        dataFormatada: d.data_formatada || d.data || '',
        totalPontos: totalPontos,
        totalAvaliacoes: totalAvaliacoes,
        media: media
      }
    }).filter(d => d !== null).sort((a, b) => a.data - b.data)

    console.log('Dados processados:', dadosProcessados)
    
    if (dadosProcessados.length === 0) {
      console.warn('Nenhum dado válido após processamento')
      return
    }

    // Escalas
    const xScale = d3.scaleTime()
      .domain(d3.extent(dadosProcessados, d => d.data))
      .range([0, innerWidth])
      .nice()

    const maxPontos = d3.max(dadosProcessados, d => d.totalPontos) || 1
    const maxMedia = d3.max(dadosProcessados, d => d.media) || 1
    const maxY = Math.max(maxPontos, maxMedia * 2) // Considerar ambas as escalas
    
    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.1]) // Adicionar 10% de espaço no topo
      .range([innerHeight, 0])
      .nice()

    // Linha suave para total de pontos
    const line = d3.line()
      .x(d => xScale(d.data))
      .y(d => yScale(d.totalPontos))
      .curve(d3.curveMonotoneX) // Curva suave

    // Linha pontilhada para média
    const lineMedia = d3.line()
      .x(d => xScale(d.data))
      .y(d => yScale(d.media))
      .curve(d3.curveMonotoneX) // Curva suave

    // Área com gradiente
    const area = d3.area()
      .x(d => xScale(d.data))
      .y0(innerHeight)
      .y1(d => yScale(d.totalPontos))
      .curve(d3.curveMonotoneX)

    // Criar gradiente rosa
    const gradientId = 'gradient-rosa'
    const defs = svg.append("defs")
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", innerHeight)
      .attr("x2", 0)
      .attr("y2", 0)

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#fce4ec")
      .attr("stop-opacity", 0.3)

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#e91e63")
      .attr("stop-opacity", 0.6)

    // Adicionar área (preenchimento)
    g.append("path")
      .datum(dadosProcessados)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", area)

    // Adicionar linha de total de pontos
    g.append("path")
      .datum(dadosProcessados)
      .attr("fill", "none")
      .attr("stroke", "#e91e63")
      .attr("stroke-width", 3)
      .attr("d", line)

    // Adicionar linha pontilhada de média
    g.append("path")
      .datum(dadosProcessados)
      .attr("fill", "none")
      .attr("stroke", "#9c27b0")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5") // Linha pontilhada
      .attr("d", lineMedia)

    // Adicionar pontos (círculos)
    g.selectAll(".point")
      .data(dadosProcessados)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.data))
      .attr("cy", d => yScale(d.totalPontos))
      .attr("r", 5)
      .attr("fill", "#e91e63")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)

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
          .style("z-index", "1000")

        tooltip.transition()
          .duration(200)
          .style("opacity", 1)

        tooltip.html(`
          <strong>${d.dataFormatada}</strong><br/>
          Total de Pontos: ${d.totalPontos.toFixed(1)}<br/>
          Avaliações: ${d.totalAvaliacoes}<br/>
          Média: ${d.media.toFixed(2)} pontos/avaliação
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5)

        d3.selectAll(".tooltip").remove()
      })

    // Eixo X
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(dadosProcessados.length, 10))
      .tickFormat(d3.timeFormat("%d/%m"))

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "11px")
      .attr("fill", "#666")

    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("fill", "#666")
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .text("Data")

    // Eixo Y
    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
      .tickFormat(d3.format("d"))

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "11px")
      .attr("fill", "#666")

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("fill", "#666")
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .text("Total de Pontos")

    // Título
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -15)
      .attr("fill", "#333")
      .style("font-size", "16px")
      .style("font-weight", "700")
      .style("text-anchor", "middle")
      .text("Evolução de Pontos ao Longo do Tempo")

    // Legenda
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 200}, 20)`)

    // Legenda - Total de Pontos
    const legendTotal = legend.append("g")
      .attr("transform", "translate(0, 0)")

    legendTotal.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#e91e63")
      .attr("stroke-width", 3)

    legendTotal.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .attr("fill", "#333")
      .style("font-size", "12px")
      .text("Total de Pontos")

    // Legenda - Média
    const legendMedia = legend.append("g")
      .attr("transform", "translate(0, 20)")

    legendMedia.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#9c27b0")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    legendMedia.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .attr("fill", "#333")
      .style("font-size", "12px")
      .text("Média por Avaliação")

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
      <div style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', overflow: 'visible' }}></svg>
      </div>
    </div>
  )
}

export default PontosTemporalLineChart

