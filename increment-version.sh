#!/bin/bash

# Script para incrementar versão automaticamente
# Uso: ./increment-version.sh [major|minor|patch]

VERSION_FILE="src/version.json"
TYPE=${1:-patch}  # Default para patch se não especificado

if [ ! -f "$VERSION_FILE" ]; then
    echo "Arquivo de versão não encontrado: $VERSION_FILE"
    exit 1
fi

# Ler versão atual
CURRENT_VERSION=$(node -p "require('./$VERSION_FILE').version")
echo "Versão atual: $CURRENT_VERSION"

# Separar major, minor, patch
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Incrementar baseado no tipo
case $TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo "Tipo inválido: $TYPE. Use major, minor ou patch"
        exit 1
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
BUILD_DATE=$(date +%Y-%m-%d)

echo "Nova versão: $NEW_VERSION"

# Atualizar arquivo de versão
cat > "$VERSION_FILE" << EOF
{
  "version": "$NEW_VERSION",
  "buildDate": "$BUILD_DATE",
  "description": "Alliance Dashboard Azure - Versão $NEW_VERSION"
}
EOF

echo "Versão atualizada para $NEW_VERSION"
echo "Data de build: $BUILD_DATE"

# Adicionar arquivo ao git se estiver em um repositório
if [ -d ".git" ]; then
    git add "$VERSION_FILE"
    echo "Arquivo de versão adicionado ao git"
fi

