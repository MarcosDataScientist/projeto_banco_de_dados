import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'

function RespostasBarChart({ data }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  // Processar dados: agrupar todas as respostas e pegar top 10
  const top10Respostas = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    // Agrupar todas as respostas e somar quantidades
    const agrupado = data.reduce((acc, item) => {
      const resposta = String(item.resposta || '').trim()
      if (!resposta) return acc

      if (acc[resposta]) {
        acc[resposta].quantidade += Number(item.quantidade) || 0
      } else {
        acc[resposta] = {
          resposta: resposta,
          quantidade: Number(item.quantidade) || 0
        }
      }
      return acc
    }, {})

    // Converter para array, ordenar por quantidade e pegar top 10
    return Object.values(agrupado)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)
  }, [data])

  // Obter dimensões do container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: Math.max(rect.width || 800, 400),
          height: Math.max(rect.height || 500, 400)
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Renderizar gráfico
  useEffect(() => {
    if (!top10Respostas || top10Respostas.length === 0) {
      // Limpar SVG se não há dados
      d3.select(svgRef.current).selectAll("*").remove()
      return
    }

    const { width, height } = dimensions

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll("*").remove()

    // Configurar dimensões
    const margin = { top: 20, right: 80, bottom: 80, left: 200 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Criar escalas
    // Eixo Y: respostas (texto) - escala de bandas
    const yScale = d3.scaleBand()
      .domain(top10Respostas.map(d => d.resposta))
      .range([0, innerHeight])
      .padding(0.2)

    // Eixo X: frequência (números) - escala linear
    const maxQuantidade = d3.max(top10Respostas, d => d.quantidade || 0)
    const xScale = d3.scaleLinear()
      .domain([0, maxQuantidade])
      .nice()
      .range([0, innerWidth])

    // Criar gradiente verde
    const gradient = d3.scaleSequential()
      .domain([0, maxQuantidade])
      .interpolator(d3.interpolateGreens)

    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Adicionar eixo X (frequência) - na parte inferior
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(Math.min(10, maxQuantidade))
        .tickFormat(d3.format("d"))
      )

    // Adicionar label do eixo X (Frequência)
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 50)
      .attr("fill", "#666")
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .style("font-weight", "500")
      .text("Frequência")

    // Adicionar eixo Y (respostas) - na esquerda
    g.append("g")
      .call(d3.axisLeft(yScale))

    // Adicionar barras horizontais
    g.selectAll(".bar")
      .data(top10Respostas)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.resposta))
      .attr("x", 0)
      .attr("width", d => xScale(d.quantidade || 0))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => gradient(d.quantidade || 0))
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
          .style("z-index", "1000")
        
        tooltip.transition()
          .duration(200)
          .style("opacity", 1)
        
        tooltip.html(`
          <strong>${d.resposta}</strong><br/>
          Frequência: ${d.quantidade || 0}
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

    // Adicionar valores nas barras (centralizados e brancos)
    g.selectAll(".bar-label")
      .data(top10Respostas)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => {
        const barWidth = xScale(d.quantidade || 0)
        return barWidth / 2
      })
      .attr("y", d => yScale(d.resposta) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#ffffff")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(0, 0, 0, 0.3)")
      .text(d => d.quantidade || 0)

  }, [top10Respostas, dimensions])

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
        Top 10 Respostas Mais Frequentes
      </h3>
      
      {top10Respostas.length === 0 && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p>Nenhuma resposta encontrada.</p>
        </div>
      )}
      
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflow: 'visible' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', overflow: 'visible' }}></svg>
      </div>
    </div>
  )
}

export default RespostasBarChart
