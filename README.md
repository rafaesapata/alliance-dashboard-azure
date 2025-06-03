# Alliance Dashboard Azure

Dashboard em React para visualização de Work Items do Azure DevOps, especificamente filtrados por Area Path "AWS Partnership". Otimizado para exibição em TV 55" (TCL 55P755).

## 🚀 Características

- **Conexão Azure DevOps**: Integração com Azure DevOps REST API v7.2
- **Filtro por Area Path**: Exibe apenas work items da área "AWS Partnership"
- **Layout TV-Friendly**: Otimizado para visualização em TV 55" sem barra de rolagem vertical
- **Modo Demonstração**: Fallback automático para dados de demonstração em caso de erro de conexão
- **Versionamento Automático**: Sistema de versionamento com incremento automático
- **Atualização Automática**: Refresh dos dados a cada 5 minutos
- **Identidade Visual**: Mantém padrão visual da UDS Tecnologia

## 📊 Indicadores Exibidos

### Métricas Principais
- **Total de Items**: Quantidade total de work items
- **Em Progresso**: Items com status "Active" ou "In Progress"
- **Concluídos**: Items com status "Done" ou "Closed"
- **Bugs**: Quantidade de bugs reportados

### Visualizações
- **Distribuição por Status**: Gráfico de barras com percentuais
- **Items Recentes**: Lista dos 5 work items mais recentes
- **Performance da Equipe**: Distribuição de work items por responsável

## 🛠️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# GitHub Token
GITHUB_TOKEN=seu_token_github

# Azure DevOps Configuration
VITE_ALLIANCE_AZURE_API_TOKEN=seu_token_azure_devops
VITE_ALLIANCE_AZURE_WORKSPACE_URL=https://dev.azure.com/sua-organizacao
VITE_ALLIANCE_AZURE_ORGANIZATION=sua-organizacao
VITE_ALLIANCE_AZURE_API_VERSION=7.2
VITE_ALLIANCE_AZURE_AREA_PATH_FILTER=AWS Partnership
```

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Inicia servidor de desenvolvimento

# Build
npm run build              # Build para produção
npm run preview            # Preview do build

# Versionamento
npm run version:patch      # Incrementa versão patch (1.0.0 -> 1.0.1)
npm run version:minor      # Incrementa versão minor (1.0.0 -> 1.1.0)
npm run version:major      # Incrementa versão major (1.0.0 -> 2.0.0)
npm run commit             # Incrementa patch + commit automático

# Linting
npm run lint               # Executa ESLint
```

## 📱 Otimizações para TV 55"

### Resolução Suportada
- **1920x1080 (Full HD)**: Layout responsivo padrão
- **3840x2160 (4K)**: Ajustes automáticos para fontes e espaçamentos maiores

### Características TV-Friendly
- **Fontes Grandes**: Títulos até 3.5rem, métricas até 2.5rem
- **Alto Contraste**: Cores vibrantes e bordas bem definidas
- **Espaçamentos Amplos**: Padding e gaps otimizados para visualização à distância
- **Ícones Maiores**: Ícones de 1.5rem a 2rem para melhor visibilidade
- **Cards Destacados**: Sombras e bordas mais pronunciadas

## 🔌 API Azure DevOps

### Endpoints Utilizados
- **WIQL Query**: `/_apis/wit/wiql` - Para consultas personalizadas
- **Work Items**: `/_apis/wit/workitems` - Para detalhes dos work items

### Autenticação
- **Método**: Basic Authentication com Personal Access Token
- **Header**: `Authorization: Basic base64(:token)`

### Query WIQL Utilizada
```sql
SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], 
       [System.CreatedDate], [System.WorkItemType], [System.AreaPath] 
FROM WorkItems 
WHERE [System.AreaPath] UNDER 'AWS Partnership' 
ORDER BY [System.CreatedDate] DESC
```

## 🎨 Tecnologias Utilizadas

- **React 19**: Framework principal
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Framework CSS
- **Shadcn/UI**: Componentes UI
- **Lucide React**: Ícones
- **Recharts**: Gráficos (preparado para uso futuro)

## 📁 Estrutura do Projeto

```
alliance-dashboard-azure/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI base
│   │   ├── Dashboard.jsx    # Componente principal do dashboard
│   │   └── Footer.jsx       # Rodapé com versionamento
│   ├── lib/
│   │   ├── azureConfig.js   # Configuração Azure DevOps
│   │   ├── azureService.js  # Serviço de API
│   │   ├── mockData.js      # Dados de demonstração
│   │   └── utils.js         # Utilitários
│   ├── App.jsx              # Componente raiz
│   ├── App.css              # Estilos otimizados para TV
│   ├── version.json         # Arquivo de versionamento
│   └── main.jsx             # Entry point
├── docs/
│   └── azure-api-notes.md   # Documentação da API
├── increment-version.sh     # Script de versionamento
├── .env                     # Variáveis de ambiente
└── README.md               # Este arquivo
```

## 🔄 Versionamento

O projeto utiliza versionamento semântico (SemVer):
- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

### Incremento Automático
```bash
# Incrementar e fazer commit automaticamente
npm run commit

# Ou incrementar manualmente
./increment-version.sh patch
git add .
git commit -m "Versão atualizada"
```

## 🚀 Deploy

### Desenvolvimento Local
```bash
npm run dev --host
# Acesse: http://localhost:5173
```

### Produção
```bash
npm run build
# Arquivos gerados em: dist/
```

## 🔍 Troubleshooting

### Erro de Conexão Azure DevOps
- Verifique se o token está correto e não expirou
- Confirme se a organização e workspace estão corretos
- O dashboard automaticamente usa dados de demonstração em caso de erro

### Layout não otimizado para TV
- Verifique se as classes CSS `tv-*` estão sendo aplicadas
- Confirme se o arquivo `App.css` foi carregado corretamente

### Variáveis de ambiente não carregadas
- Certifique-se que as variáveis começam com `VITE_`
- Reinicie o servidor de desenvolvimento após alterar o `.env`

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento da UDS Tecnologia.

---

**Alliance Dashboard Azure v1.0.0**  
© 2025 UDS Tecnologia - Azure DevOps Integration

