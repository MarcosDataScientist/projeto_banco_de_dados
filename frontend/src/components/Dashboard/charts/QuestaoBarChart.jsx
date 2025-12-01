import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'

function QuestaoBarChart({ data }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Processar dados
  const dadosProcessados = useMemo(() => {
    if (!data || data.length === 0) {
      return null
    }

    // Os dados já vêm agrupados por alternativa
    const primeiraLinha = data[0]
    return {
      questao_id: primeiraLinha.questao_id,
      pergunta: primeiraLinha.pergunta,
      alternativas: data.map(item => ({
        alternativa: item.alternativa_selecionada,
        quantidade: Number(item.quantidade) || 0
      }))
    }
  }, [data])

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

  // Renderizar gráfico
  useEffect(() => {
    if (!dadosProcessados || !dadosProcessados.alternativas || dadosProcessados.alternativas.length === 0) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove()
      }
      return
    }

    const { width, height } = dimensions
    const margin = { top: 50, right: 80, bottom: 60, left: 200 }
    const innerWidth = Math.max(width - margin.left - margin.right, 400)
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

    // Calcular total de avaliações
    const totalAvaliacoes = dadosProcessados.alternativas.reduce((sum, alt) => {
      const qtd = Number(alt.quantidade) || 0
      return sum + qtd
    }, 0)

    const maxParaEscala = Math.max(totalAvaliacoes, 1)

    // Escala X
    const xScale = d3.scaleLinear()
      .domain([0, maxParaEscala])
      .range([0, innerWidth])

    // Escala Y
    const yScale = d3.scaleBand()
      .domain(dadosProcessados.alternativas.map(d => d.alternativa))
      .range([0, innerHeight])
      .padding(0.15)

    // Gradiente de cores
    const gradient = d3.scaleSequential()
      .domain([0, maxParaEscala])
      .interpolator(d3.interpolateBlues)

    // Título da pergunta
    g.append("text")
      .attr("x", -margin.left)
      .attr("y", -25)
      .attr("font-size", "16px")
      .attr("font-weight", "700")
      .attr("fill", "#1f2937")
      .text(`${dadosProcessados.pergunta} (Total: ${totalAvaliacoes} avaliações)`)

    // Eixo Y (alternativas)
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "11px")

    // Eixo X (quantidade)
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(Math.min(maxParaEscala + 1, 11))
        .tickFormat(d3.format("d"))
        .tickValues(d3.range(0, maxParaEscala + 1, 1))
      )

    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 45)
      .attr("fill", "#666")
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .text("Quantidade")

    // Renderizar barras
    const bars = g.selectAll(".questao-bar")
      .data(dadosProcessados.alternativas)
      .enter()
      .append("rect")
      .attr("class", "questao-bar")
      .attr("y", d => yScale(d.alternativa))
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("rx", 4)
      .attr("width", d => {
        const quantidade = Number(d.quantidade) || 0
        if (totalAvaliacoes > 0 && quantidade > 0) {
          return (quantidade / totalAvaliacoes) * innerWidth
        }
        return 0
      })
      .attr("fill", d => {
        const quantidade = Number(d.quantidade) || 0
        return gradient(quantidade)
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)

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

        const quantidade = Number(d.quantidade) || 0
        tooltip.html(`
          <strong>${d.alternativa}</strong><br/>
          Quantidade: ${quantidade} de ${totalAvaliacoes}
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

    // Valores nas barras
    g.selectAll(".bar-label")
      .data(dadosProcessados.alternativas)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => {
        const quantidade = Number(d.quantidade) || 0
        if (totalAvaliacoes > 0 && quantidade > 0) {
          const barWidth = (quantidade / totalAvaliacoes) * innerWidth
          return barWidth < 30 ? barWidth + 5 : barWidth / 2
        }
        return 5
      })
      .attr("y", d => yScale(d.alternativa) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => {
        const quantidade = Number(d.quantidade) || 0
        if (totalAvaliacoes > 0 && quantidade > 0) {
          const barWidth = (quantidade / totalAvaliacoes) * innerWidth
          return barWidth < 30 ? "start" : "middle"
        }
        return "start"
      })
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", d => {
        const quantidade = Number(d.quantidade) || 0
        if (totalAvaliacoes > 0 && quantidade > 0) {
          const barWidth = (quantidade / totalAvaliacoes) * innerWidth
          return barWidth < 30 ? "#333" : "#ffffff"
        }
        return "#333"
      })
      .style("pointer-events", "none")
      .style("text-shadow", d => {
        const quantidade = Number(d.quantidade) || 0
        if (totalAvaliacoes > 0 && quantidade > 0) {
          const barWidth = (quantidade / totalAvaliacoes) * innerWidth
          return barWidth < 30 ? "none" : "0 1px 2px rgba(0, 0, 0, 0.3)"
        }
        return "none"
      })
      .text(d => d.quantidade)

  }, [dadosProcessados, dimensions])

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <div style={{ width: '100%', height: 'calc(100% - 20px)', overflow: 'auto' }}>
        <svg ref={svgRef} style={{ width: '100%', overflow: 'visible' }}></svg>
      </div>
    </div>
  )
}

export default QuestaoBarChart

