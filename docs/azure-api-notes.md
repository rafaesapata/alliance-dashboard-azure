# Azure DevOps REST API - Informações Importantes

## Estrutura da URL da API
- **Azure DevOps Services**: `https://dev.azure.com/{organization}/_apis[/{area}]/{resource}?api-version={version}`
- **Exemplo para Work Items**: `https://dev.azure.com/{organization}/_apis/wit/workitems`

## Autenticação
- Usar Personal Access Token (PAT) no header Authorization
- Formato: `Authorization: Basic BASE64(:{PAT})`
- Converter PAT para Base64: `btoa(':' + token)`

## Endpoints Importantes para Work Items
1. **WIQL (Work Item Query Language)**: `/_apis/wit/wiql`
2. **Work Items**: `/_apis/wit/workitems`
3. **Versão da API**: `7.2`

## Exemplo de Query WIQL para Area Path
```sql
SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], [System.CreatedDate], [System.WorkItemType], [System.AreaPath] 
FROM WorkItems 
WHERE [System.AreaPath] UNDER 'AWS Partnership' 
ORDER BY [System.CreatedDate] DESC
```

## Headers Necessários
- `Content-Type: application/json`
- `Accept: application/json`
- `Authorization: Basic {base64_encoded_token}`

## Campos Importantes dos Work Items
- System.Id
- System.Title
- System.State
- System.AssignedTo
- System.CreatedDate
- System.WorkItemType
- System.AreaPath
- Microsoft.VSTS.Common.Priority
- System.Tags

