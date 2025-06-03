import { azureConfig, validateConfig } from './azureConfig.js';

class AzureDevOpsService {
  constructor() {
    validateConfig();
  }

  // Buscar work items usando WIQL (Work Item Query Language)
  async getWorkItemsByAreaPath(areaPath = azureConfig.areaPathFilter) {
    try {
      console.log('🔍 Iniciando busca de work items...');
      console.log('📍 Area Path:', areaPath);
      console.log('🌐 Base URL:', azureConfig.getBaseUrl());
      
      // Query WIQL para buscar work items por Area Path
      const wiqlQuery = {
        query: `SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], [System.CreatedDate], [System.WorkItemType], [System.AreaPath] FROM WorkItems WHERE [System.AreaPath] UNDER '${areaPath}' ORDER BY [System.CreatedDate] DESC`
      };

      console.log('📝 Query WIQL:', wiqlQuery.query);

      // Primeira chamada: executar query WIQL
      const wiqlUrl = `${azureConfig.getWiqlUrl()}?api-version=${azureConfig.apiVersion}`;
      console.log('🔗 URL WIQL:', wiqlUrl);
      
      const wiqlResponse = await fetch(wiqlUrl, {
        method: 'POST',
        headers: azureConfig.getHeaders(),
        body: JSON.stringify(wiqlQuery)
      });

      console.log('📡 Resposta WIQL Status:', wiqlResponse.status);
      console.log('📡 Resposta WIQL Headers:', Object.fromEntries(wiqlResponse.headers.entries()));

      if (!wiqlResponse.ok) {
        const errorText = await wiqlResponse.text();
        console.error('❌ Erro na query WIQL:', {
          status: wiqlResponse.status,
          statusText: wiqlResponse.statusText,
          body: errorText
        });
        throw new Error(`Erro na query WIQL: ${wiqlResponse.status} ${wiqlResponse.statusText} - ${errorText}`);
      }

      const wiqlResult = await wiqlResponse.json();
      console.log('✅ Resultado WIQL:', wiqlResult);
      
      if (!wiqlResult.workItems || wiqlResult.workItems.length === 0) {
        console.log('⚠️ Nenhum work item encontrado para a Area Path:', areaPath);
        return [];
      }

      // Extrair IDs dos work items
      const workItemIds = wiqlResult.workItems.map(wi => wi.id);
      console.log('🔢 IDs dos work items encontrados:', workItemIds);
      
      // Segunda chamada: buscar detalhes dos work items
      const workItemsUrl = `${azureConfig.getWorkItemsUrl()}?ids=${workItemIds.join(',')}&$expand=all&api-version=${azureConfig.apiVersion}`;
      console.log('🔗 URL Work Items:', workItemsUrl);
      
      const workItemsResponse = await fetch(workItemsUrl, {
        method: 'GET',
        headers: azureConfig.getHeaders()
      });

      console.log('📡 Resposta Work Items Status:', workItemsResponse.status);

      if (!workItemsResponse.ok) {
        const errorText = await workItemsResponse.text();
        console.error('❌ Erro ao buscar work items:', {
          status: workItemsResponse.status,
          statusText: workItemsResponse.statusText,
          body: errorText
        });
        throw new Error(`Erro ao buscar work items: ${workItemsResponse.status} ${workItemsResponse.statusText} - ${errorText}`);
      }

      const workItemsResult = await workItemsResponse.json();
      console.log('✅ Work items detalhados:', workItemsResult);
      
      // Processar e formatar os dados
      const formattedItems = this.formatWorkItems(workItemsResult.value || []);
      console.log('🎯 Work items formatados:', formattedItems);
      
      return formattedItems;
      
    } catch (error) {
      console.error('💥 Erro geral ao buscar work items:', error);
      console.error('📊 Stack trace:', error.stack);
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
      url: item._links?.html?.href || '',
      // Campos customizados - podem não existir na API real
      valor: item.fields['Custom.Valor'] || item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] ? 
        `$${(item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] * 1000).toLocaleString('en-US')}.00` : 
        'Não informado',
      cliente: item.fields['Custom.Cliente'] || item.fields['System.AreaPath']?.split('\\').pop() || 'Não informado',
      cashClaim: item.fields['Custom.CashClaim'] || item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] ? 
        `$${(item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] * 400).toLocaleString('en-US')}.00` : 
        'Não informado'
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

  // Testar conexão com a API - versão melhorada
  async testConnection() {
    try {
      console.log('🧪 Testando conexão com Azure DevOps...');
      console.log('🔗 URL de teste:', `${azureConfig.getBaseUrl()}/projects?api-version=${azureConfig.apiVersion}`);
      console.log('🔑 Headers:', azureConfig.getHeaders());
      
      const response = await fetch(`${azureConfig.getBaseUrl()}/projects?api-version=${azureConfig.apiVersion}`, {
        method: 'GET',
        headers: azureConfig.getHeaders()
      });

      console.log('📡 Status da conexão:', response.status);
      console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conexão bem-sucedida! Projetos encontrados:', data.count);
        return {
          success: true,
          status: response.status,
          message: `Conexão bem-sucedida! ${data.count} projetos encontrados.`,
          data: data
        };
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na conexão:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return {
          success: false,
          status: response.status,
          message: `Erro: ${response.status} ${response.statusText} - ${errorText}`,
          error: errorText
        };
      }
    } catch (error) {
      console.error('💥 Erro de conexão:', error);
      return {
        success: false,
        status: 0,
        message: `Erro de conexão: ${error.message}`,
        error: error.message
      };
    }
  }

  // Verificar se a Area Path existe
  async checkAreaPath(areaPath = azureConfig.areaPathFilter) {
    try {
      console.log('🔍 Verificando se Area Path existe:', areaPath);
      
      // Buscar classificações de área (area paths)
      const response = await fetch(
        `${azureConfig.getBaseUrl()}/wit/classificationnodes/areas?api-version=${azureConfig.apiVersion}&$depth=10`,
        {
          method: 'GET',
          headers: azureConfig.getHeaders()
        }
      );

      if (!response.ok) {
        console.error('❌ Erro ao buscar area paths:', response.status, response.statusText);
        return { exists: false, error: `${response.status} ${response.statusText}` };
      }

      const data = await response.json();
      console.log('📁 Area paths disponíveis:', data);
      
      // Verificar se a area path existe (busca recursiva)
      const exists = this.findAreaPathInTree(data, areaPath);
      console.log(`📍 Area Path '${areaPath}' ${exists ? 'encontrada' : 'não encontrada'}`);
      
      return { exists, data };
    } catch (error) {
      console.error('💥 Erro ao verificar area path:', error);
      return { exists: false, error: error.message };
    }
  }

  // Buscar area path na árvore de classificações
  findAreaPathInTree(node, targetPath) {
    if (node.name === targetPath || node.path === targetPath) {
      return true;
    }
    
    if (node.children) {
      for (const child of node.children) {
        if (this.findAreaPathInTree(child, targetPath)) {
          return true;
        }
      }
    }
    
    return false;
  }
}

export default new AzureDevOpsService();

