// Configuração para Azure DevOps API
export const azureConfig = {
  apiToken: import.meta.env.VITE_ALLIANCE_AZURE_API_TOKEN,
  workspaceUrl: import.meta.env.VITE_ALLIANCE_AZURE_WORKSPACE_URL,
  organization: import.meta.env.VITE_ALLIANCE_AZURE_ORGANIZATION,
  apiVersion: import.meta.env.VITE_ALLIANCE_AZURE_API_VERSION || '7.2',
  areaPathFilter: import.meta.env.VITE_ALLIANCE_AZURE_AREA_PATH_FILTER || 'AWS Partnership',
  
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

// Validação de configuração
export const validateConfig = () => {
  const required = ['apiToken', 'workspaceUrl', 'organization'];
  const missing = required.filter(key => !azureConfig[key]);
  
  if (missing.length > 0) {
    throw new Error(`Configuração Azure DevOps incompleta. Faltam: ${missing.join(', ')}`);
  }
  
  return true;
};

