# Guia de Deploy - Alliance Dashboard Azure

## 🚀 Deploy em Produção

### Pré-requisitos
- Node.js 18+ instalado
- Token de acesso do Azure DevOps
- Servidor web (Nginx, Apache, ou similar)

### 1. Configuração do Ambiente

#### Variáveis de Ambiente de Produção
```env
# Azure DevOps Configuration
VITE_ALLIANCE_AZURE_API_TOKEN=4vTr8a70d6foVRlpmzWmLEqkne5YwQtkthnZUVqmzlkQBUEhJ65SJQQJ99BFACAAAAALySHRAAASAZDO2J77
VITE_ALLIANCE_AZURE_WORKSPACE_URL=https://dev.azure.com/uds-tecnologia
VITE_ALLIANCE_AZURE_ORGANIZATION=uds-tecnologia
VITE_ALLIANCE_AZURE_API_VERSION=7.2-preview
VITE_ALLIANCE_AZURE_AREA_PATH_FILTER=AWS Partnership
```

### 2. Build para Produção

```bash
# 1. Instalar dependências
npm install

# 2. Executar build
npm run build

# 3. Arquivos gerados em: dist/
```

### 3. Configuração do Servidor Web

#### Nginx
```nginx
server {
    listen 80;
    server_name dashboard-azure.uds.com.br;
    
    root /var/www/alliance-dashboard-azure/dist;
    index index.html;
    
    # Configuração para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Compressão
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteBase /

# Handle Angular and other SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### 4. Configuração para TV 55"

#### Resolução Recomendada
- **1920x1080**: Configuração padrão
- **3840x2160**: Para TVs 4K

#### Configurações do Browser/TV
```javascript
// Configurações recomendadas para kiosk mode
{
    "fullscreen": true,
    "autoRefresh": 300000, // 5 minutos
    "zoomLevel": 1.0,
    "disableScrollbars": true
}
```

### 5. Monitoramento e Logs

#### Health Check Endpoint
O dashboard não possui endpoint de health check próprio, mas você pode monitorar:
- Status HTTP 200 na página principal
- Presença do elemento com título "Alliance Dashboard Azure"

#### Logs de Erro
Monitore o console do browser para:
- Erros de conexão com Azure DevOps API
- Falhas de autenticação
- Problemas de CORS

### 6. Backup e Versionamento

#### Backup dos Arquivos
```bash
# Backup do diretório de produção
tar -czf alliance-dashboard-$(date +%Y%m%d).tar.gz /var/www/alliance-dashboard-azure/
```

#### Controle de Versão
```bash
# Verificar versão atual
cat /var/www/alliance-dashboard-azure/dist/src/version.json

# Histórico de deploys
git log --oneline --grep="deploy"
```

### 7. Troubleshooting de Produção

#### Dashboard não carrega
1. Verificar se os arquivos estão no diretório correto
2. Conferir permissões dos arquivos (644 para arquivos, 755 para diretórios)
3. Verificar logs do servidor web

#### Erro de CORS
```nginx
# Adicionar headers CORS no Nginx
add_header Access-Control-Allow-Origin "https://dev.azure.com";
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
add_header Access-Control-Allow-Headers "Authorization, Content-Type";
```

#### Dados não carregam
1. Verificar se o token Azure DevOps está válido
2. Testar conectividade com `curl`:
```bash
curl -H "Authorization: Basic $(echo -n ':TOKEN' | base64)" \
     "https://dev.azure.com/uds-tecnologia/_apis/projects?api-version=7.2"
```

### 8. Configuração de Auto-Deploy

#### GitHub Actions (exemplo)
```yaml
name: Deploy Alliance Dashboard Azure

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      env:
        VITE_ALLIANCE_AZURE_API_TOKEN: ${{ secrets.AZURE_TOKEN }}
        VITE_ALLIANCE_AZURE_WORKSPACE_URL: https://dev.azure.com/uds-tecnologia
        VITE_ALLIANCE_AZURE_ORGANIZATION: uds-tecnologia
        
    - name: Deploy to server
      run: |
        rsync -avz --delete dist/ user@server:/var/www/alliance-dashboard-azure/
```

### 9. Configurações de Segurança

#### Headers de Segurança
```nginx
# Adicionar no Nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

#### Proteção do Token
- Nunca expor o token Azure DevOps no código frontend
- Usar variáveis de ambiente em produção
- Rotacionar tokens periodicamente

### 10. Manutenção

#### Atualizações Regulares
```bash
# Atualizar dependências (mensal)
npm update

# Verificar vulnerabilidades
npm audit

# Atualizar versão
npm run version:patch
```

#### Limpeza de Cache
```bash
# Limpar cache do browser/TV
# Adicionar timestamp nos assets ou usar cache busting
```

---

**Contato para Suporte**  
Equipe de Desenvolvimento - UDS Tecnologia  
Email: dev@uds.com.br

