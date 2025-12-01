import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'

function AvaliacaoRespostasBarChart({ data }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })


  // Processar dados: agrupar por pergunta e alternativas
  const dadosProcessados = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    // Agrupar por pergunta
    const porPergunta = data.reduce((acc, item) => {
      const perguntaId = item.questao_id
      const pergunta = item.pergunta
      const alternativa = item.alternativa_selecionada || 'Sem resposta'
      const quantidade = Number(item.quantidade) || 0

      if (!acc[perguntaId]) {
        acc[perguntaId] = {
          perguntaId,
          pergunta,
          alternativas: []
        }
      }

      // O backend já retorna dados agrupados, então cada alternativa aparece apenas uma vez
      // Mas vamos garantir que não haja duplicatas e somar se houver
      const altExistente = acc[perguntaId].alternativas.find(
        alt => alt.alternativa === alternativa
      )

      if (altExistente) {
        // Se já existe, somar a quantidade (caso haja duplicatas)
        altExistente.quantidade = (Number(altExistente.quantidade) || 0) + quantidade
      } else {
        // Se não existe, adicionar nova
        acc[perguntaId].alternativas.push({
          alternativa,
          quantidade: Number(quantidade) || 0
        })
      }

      return acc
    }, {})

    // Converter para array
    const resultado = Object.values(porPergunta).map(item => ({
      ...item,
      alternativas: item.alternativas
    }))
    
    return resultado
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
    if (!dadosProcessados || dadosProcessados.length === 0) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove()
      }
      return
    }

    const { width, height } = dimensions
    const numPerguntas = dadosProcessados.length
    
    if (numPerguntas === 0) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove()
      }
      return
    }

    // Calcular altura por gráfico (pergunta) baseado no número de alternativas
    const calcularAlturaPorGrafico = (numAlternativas) => {
      const alturaMinima = 50
      const alturaPorAlternativa = 40
      const margens = 80 // top + bottom
      return Math.max(alturaMinima, (numAlternativas * alturaPorAlternativa) + margens)
    }
    
    const margin = { top: 50, right: 80, bottom: 60, left: 200 }
    const innerWidth = Math.max(width - margin.left - margin.right, 400)

    // Calcular altura total necessária
    let alturaAcumulada = 0
    const alturasPorPergunta = dadosProcessados.map(item => {
      const altura = calcularAlturaPorGrafico(item.alternativas.length)
      alturaAcumulada += altura
      return altura
    })

    // Limpar SVG anterior completamente
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove()
    }

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", Math.max(alturaAcumulada, 400))
      .style("overflow", "visible")

    // Criar um gráfico para cada pergunta
    let offsetY = 0
    dadosProcessados.forEach((item, index) => {
      const alturaGrafico = alturasPorPergunta[index]
      const innerHeight = alturaGrafico - margin.top - margin.bottom
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${offsetY + margin.top})`)

      // Calcular total de avaliações para esta pergunta
      const totalAvaliacoes = item.alternativas.reduce((sum, alt) => {
        const qtd = Number(alt.quantidade) || 0
        return sum + qtd
      }, 0)
      
      // Máximo para a escala do eixo X
      const maxParaEscala = Math.max(totalAvaliacoes, 1)
      
      // Criar escala X - apenas para o eixo, não para calcular larguras
      const xScale = d3.scaleLinear()
        .domain([0, maxParaEscala])
        .range([0, innerWidth])

      // Escala Y para alternativas
      const yScale = d3.scaleBand()
        .domain(item.alternativas.map(d => d.alternativa))
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
        .text(`Pergunta ${index + 1}: ${item.pergunta} (Total: ${totalAvaliacoes} avaliações)`)

      // Eixo Y (alternativas)
      g.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "11px")

      // Eixo X (quantidade) - garantir que mostre de 0 até o total
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .ticks(Math.min(maxParaEscala + 1, 11)) // Incluir 0 e todos os valores até o total
          .tickFormat(d3.format("d"))
          .tickValues(d3.range(0, maxParaEscala + 1, 1)) // Forçar ticks em cada inteiro de 0 até total
        )

      xAxis.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 45)
        .attr("fill", "#666")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text("Quantidade")

      // Renderizar barras - calcular largura proporcionalmente
      const bars = g.selectAll(".avaliacao-bar")
        .data(item.alternativas)
        .enter()
        .append("rect")
        .attr("class", "avaliacao-bar") // Usar classe diferente para evitar conflito com CSS
        .attr("y", d => yScale(d.alternativa))
        .attr("x", 0)
        .attr("height", yScale.bandwidth())
        .attr("rx", 4)
        .attr("width", d => {
          const quantidade = Number(d.quantidade) || 0
          
          // Calcular largura proporcional: (quantidade / total) * largura disponível
          if (totalAvaliacoes > 0 && quantidade > 0) {
            const largura = (quantidade / totalAvaliacoes) * innerWidth
            return largura
          }
          
          return 0
        })

      // Definir cor das barras
      bars.attr("fill", d => {
        const quantidade = Number(d.quantidade) || 0
        return gradient(quantidade)
      })

      // Adicionar interatividade
      bars.on("mouseover", function(event, d) {
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
        .data(item.alternativas)
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
      
      // Incrementar offsetY para a próxima pergunta
      offsetY += alturaGrafico
    })

  }, [dadosProcessados, dimensions])

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600, flexShrink: 0 }}>
        Respostas por Pergunta e Alternativa
      </h3>
      
      {dadosProcessados.length === 0 && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          background: '#f5f5f5',
          borderRadius: '8px',
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p>Nenhuma resposta encontrada.</p>
        </div>
      )}
      
      <div 
        className="custom-scrollbar"
        style={{ 
          width: '100%', 
          flex: '1', 
          overflow: 'auto', 
          minHeight: 0 
        }}
      >
        <svg ref={svgRef} style={{ width: '100%', overflow: 'visible' }}></svg>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #000 transparent;
        }
      `}</style>
    </div>
  )
}

export default AvaliacaoRespostasBarChart

