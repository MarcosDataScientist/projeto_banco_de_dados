#!/bin/bash
# Script para ativar o ambiente virtual Python

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "❌ Ambiente virtual não encontrado!"
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
    
    echo "📥 Instalando dependências..."
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    echo "✅ Ambiente virtual criado e dependências instaladas!"
else
    echo "✅ Ambiente virtual encontrado!"
fi

# Ativar o ambiente virtual
source venv/bin/activate

echo "🚀 Ambiente virtual ativado!"
echo "💡 Para desativar, digite: deactivate"
echo ""

