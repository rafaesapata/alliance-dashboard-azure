import { azureConfig, validateConfig } from './azureConfig.js';

class AzureDevOpsService {
  constructor() {
    validateConfig();
  }

  // Buscar work items usando WIQL (Work Item Query Language)
  async getWorkItemsByAreaPath(areaPath = azureConfig.areaPathFilter) {
    try {
      // Query WIQL para buscar work items por Area Path
      const wiqlQuery = {
        query: `SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], [System.CreatedDate], [System.WorkItemType], [System.AreaPath] FROM WorkItems WHERE [System.AreaPath] UNDER '${areaPath}' ORDER BY [System.CreatedDate] DESC`
      };

      // Primeira chamada: executar query WIQL
      const wiqlResponse = await fetch(`${azureConfig.getWiqlUrl()}?api-version=${azureConfig.apiVersion}`, {
        method: 'POST',
        headers: azureConfig.getHeaders(),
        body: JSON.stringify(wiqlQuery)
      });

      if (!wiqlResponse.ok) {
        throw new Error(`Erro na query WIQL: ${wiqlResponse.status} ${wiqlResponse.statusText}`);
      }

      const wiqlResult = await wiqlResponse.json();
      
      if (!wiqlResult.workItems || wiqlResult.workItems.length === 0) {
        return [];
      }

      // Extrair IDs dos work items
      const workItemIds = wiqlResult.workItems.map(wi => wi.id);
      
      // Segunda chamada: buscar detalhes dos work items
      const workItemsResponse = await fetch(
        `${azureConfig.getWorkItemsUrl()}?ids=${workItemIds.join(',')}&$expand=all&api-version=${azureConfig.apiVersion}`,
        {
          method: 'GET',
          headers: azureConfig.getHeaders()
        }
      );

      if (!workItemsResponse.ok) {
        throw new Error(`Erro ao buscar work items: ${workItemsResponse.status} ${workItemsResponse.statusText}`);
      }

      const workItemsResult = await workItemsResponse.json();
      
      // Processar e formatar os dados
      return this.formatWorkItems(workItemsResult.value || []);
      
    } catch (error) {
      console.error('Erro ao buscar work items:', error);
      throw error;
    }
  }

  // Formatar dados dos work items para o dashboard
  formatWorkItems(workItems) {
    return workItems.map(item => ({
      id: item.id,
      title: item.fields['System.Title'],
      state: item.fields['System.State'],
      workItemType: item.fields['System.WorkItemType'],
      assignedTo: item.fields['System.AssignedTo']?.displayName || 'Não atribuído',
      createdDate: new Date(item.fields['System.CreatedDate']),
      areaPath: item.fields['System.AreaPath'],
      priority: item.fields['Microsoft.VSTS.Common.Priority'] || 'Não definida',
      tags: item.fields['System.Tags'] || '',
      url: item._links?.html?.href || ''
    }));
  }

  // Obter estatísticas dos work items
  getWorkItemStats(workItems) {
    const stats = {
      total: workItems.length,
      byState: {},
      byType: {},
      byAssignee: {},
      recentItems: workItems.slice(0, 5) // 5 mais recentes
    };

    workItems.forEach(item => {
      // Por estado
      stats.byState[item.state] = (stats.byState[item.state] || 0) + 1;
      
      // Por tipo
      stats.byType[item.workItemType] = (stats.byType[item.workItemType] || 0) + 1;
      
      // Por responsável
      stats.byAssignee[item.assignedTo] = (stats.byAssignee[item.assignedTo] || 0) + 1;
    });

    return stats;
  }

  // Testar conexão com a API
  async testConnection() {
    try {
      const response = await fetch(`${azureConfig.getBaseUrl()}/projects?api-version=${azureConfig.apiVersion}`, {
        method: 'GET',
        headers: azureConfig.getHeaders()
      });

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexão bem-sucedida' : `Erro: ${response.statusText}`
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: `Erro de conexão: ${error.message}`
      };
    }
  }
}

export default new AzureDevOpsService();

