// Debug das variáveis de ambiente
export const debugEnvVars = () => {
  const envVars = {
    VITE_ALLIANCE_AZURE_API_TOKEN: import.meta.env.VITE_ALLIANCE_AZURE_API_TOKEN,
    VITE_ALLIANCE_AZURE_WORKSPACE_URL: import.meta.env.VITE_ALLIANCE_AZURE_WORKSPACE_URL,
    VITE_ALLIANCE_AZURE_ORGANIZATION: import.meta.env.VITE_ALLIANCE_AZURE_ORGANIZATION,
    VITE_ALLIANCE_AZURE_API_VERSION: import.meta.env.VITE_ALLIANCE_AZURE_API_VERSION,
    VITE_ALLIANCE_AZURE_AREA_PATH_FILTER: import.meta.env.VITE_ALLIANCE_AZURE_AREA_PATH_FILTER,
    VITE_ALLIANCE_AZURE_META_MENSAL: import.meta.env.VITE_ALLIANCE_AZURE_META_MENSAL,
    VITE_ALLIANCE_AZURE_META_TRIMESTRAL: import.meta.env.VITE_ALLIANCE_AZURE_META_TRIMESTRAL
  };

  console.log('🔍 Debug - Variáveis de Ambiente:', envVars);
  
  // Verificar quais estão undefined
  const undefined_vars = Object.entries(envVars)
    .filter(([key, value]) => value === undefined)
    .map(([key]) => key);
    
  if (undefined_vars.length > 0) {
    console.warn('⚠️ Variáveis não definidas:', undefined_vars);
  }
  
  // Verificar quais estão vazias
  const empty_vars = Object.entries(envVars)
    .filter(([key, value]) => value === '')
    .map(([key]) => key);
    
  if (empty_vars.length > 0) {
    console.warn('⚠️ Variáveis vazias:', empty_vars);
  }
  
  return envVars;
};

// Configuração para Azure DevOps API com debug
export const azureConfig = {
  apiToken: import.meta.env.VITE_ALLIANCE_AZURE_API_TOKEN,
  workspaceUrl: import.meta.env.VITE_ALLIANCE_AZURE_WORKSPACE_URL,
  organization: import.meta.env.VITE_ALLIANCE_AZURE_ORGANIZATION,
  apiVersion: import.meta.env.VITE_ALLIANCE_AZURE_API_VERSION || '7.1',
  areaPathFilter: import.meta.env.VITE_ALLIANCE_AZURE_AREA_PATH_FILTER || 'AWS Partnership',
  
  // Metas de performance (com valores padrão)
  metaMensal: parseInt(import.meta.env.VITE_ALLIANCE_AZURE_META_MENSAL) || 25000,
  metaTrimestral: parseInt(import.meta.env.VITE_ALLIANCE_AZURE_META_TRIMESTRAL) || 75000,
  
  // URLs base para diferentes endpoints
  getBaseUrl: () => `${azureConfig.workspaceUrl}/_apis`,
  getWorkItemsUrl: () => `${azureConfig.getBaseUrl()}/wit/workitems`,
  getWiqlUrl: () => `${azureConfig.getBaseUrl()}/wit/wiql`,
  
  // Headers padrão para autenticação
  getHeaders: () => ({
    'Authorization': `Basic ${btoa(`:${azureConfig.apiToken}`)}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  })
};

// Validação de configuração melhorada
export const validateConfig = () => {
  console.log('🔍 Iniciando validação de configuração...');
  
  // Debug das variáveis
  debugEnvVars();
  
  const required = ['apiToken', 'workspaceUrl', 'organization'];
  const missing = required.filter(key => {
    const value = azureConfig[key];
    const isEmpty = !value || value === '' || value === 'undefined';
    if (isEmpty) {
      console.error(`❌ Variável ${key} está vazia ou indefinida:`, value);
    }
    return isEmpty;
  });
  
  if (missing.length > 0) {
    const error = `Configuração Azure DevOps incompleta. Faltam: ${missing.join(', ')}`;
    console.error('❌ Erro de validação:', error);
    throw new Error(error);
  }
  
  console.log('✅ Configuração validada com sucesso!');
  return true;
};

