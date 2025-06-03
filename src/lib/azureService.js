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
    return workItems.map(item => {
      const createdDate = new Date(item.fields['System.CreatedDate']);
      const modifiedDate = item.fields['System.ChangedDate'] ? new Date(item.fields['System.ChangedDate']) : null;
      
      // Debug específico para work item 22677
      if (item.id === 22677) {
        console.log('🔍 DEBUG Work Item 22677:');
        console.log('📋 Todos os campos disponíveis:', Object.keys(item.fields));
        console.log('💰 Campos de valor encontrados:');
        Object.keys(item.fields).forEach(key => {
          if (key.toLowerCase().includes('valor') || key.toLowerCase().includes('value') || key.toLowerCase().includes('cash') || key.toLowerCase().includes('claim')) {
            console.log(`  - ${key}: ${item.fields[key]}`);
          }
        });
        console.log('🏢 Campos de cliente encontrados:');
        Object.keys(item.fields).forEach(key => {
          if (key.toLowerCase().includes('client') || key.toLowerCase().includes('customer') || key.toLowerCase().includes('empresa')) {
            console.log(`  - ${key}: ${item.fields[key]}`);
          }
        });
        console.log('📊 Campos customizados (Custom.*):');
        Object.keys(item.fields).forEach(key => {
          if (key.startsWith('Custom.') || key.includes('Custom')) {
            console.log(`  - ${key}: ${item.fields[key]}`);
          }
        });
      }
      
      return {
        id: item.id,
        title: item.fields['System.Title'],
        state: item.fields['System.State'],
        workItemType: item.fields['System.WorkItemType'],
        assignedTo: item.fields['System.AssignedTo']?.displayName || 'Não atribuído',
        createdDate: createdDate.toLocaleDateString('pt-BR'),
        modifiedDate: modifiedDate ? modifiedDate.toLocaleDateString('pt-BR') : null,
        createdDateObj: createdDate, // Para cálculos internos
        areaPath: item.fields['System.AreaPath'],
        priority: item.fields['Microsoft.VSTS.Common.Priority'] || 'Não definida',
        tags: item.fields['System.Tags'] || '',
        url: item._links?.html?.href || '',
        type: item.fields['System.WorkItemType'], // Adicionar campo type para os ícones
        // Campos customizados - nomes corretos conforme informado
        valor: item.fields['Custom.Valorsolicitado'] ? 
          `$${parseFloat(item.fields['Custom.Valorsolicitado']).toLocaleString('en-US')}.00` :
          (item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] ? 
            `$${(item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] * 1000).toLocaleString('en-US')}.00` : 
            'Não informado'),
        oportunidade: item.fields['Custom.Oportunidade'] || 'Não informado',
        cliente: item.fields['Custom.Cliente'] || 
          item.fields['Cliente'] ||
          item.fields['Customer'] ||
          item.fields['System.AreaPath']?.split('\\').pop() || 'Não informado',
        cashClaim: item.fields['Cash Claim'] || 
          item.fields['Custom.CashClaim'] ||
          item.fields['Custom.Cash Claim'] ||
          item.fields['CashClaim'] ||
          (item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] ? 
            `$${(item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] * 400).toLocaleString('en-US')}.00` : 
            'Não informado')
      };
    });
  }

  // Obter estatísticas dos work items
  getWorkItemStats(workItems) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);
    
    const stats = {
      total: workItems.length,
      byState: {},
      byType: {},
      byAssignee: {},
      recentItems: workItems.slice(0, 12), // 12 mais recentes para melhor aproveitamento da tela
      valorMes: 0,
      valorTrimestre: 0,
      totalValue: 0,
      totalCashClaim: 0
    };tem => {
      // Por estado
      stats.byState[item.state] = (stats.byState[item.state] || 0) + 1;
      
      // Por tipo
      stats.byType[item.workItemType] = (stats.byType[item.workItemType] || 0) + 1;
      
      // Por responsável
      stats.byAssignee[item.assignedTo] = (stats.byAssignee[item.assignedTo] || 0) + 1;
      
      // Calcular valores
      const itemValue = this.parseValueToNumber(item.valor);
      stats.totalValue += itemValue;
      
      // Verificar se é do mês atual - usar createdDateObj para cálculos
      const itemDate = item.createdDateObj || new Date(item.createdDate);
      if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
        stats.valorMes += itemValue;
      }
      
      // Verificar se é do trimestre atual
      const itemQuarter = Math.floor(itemDate.getMonth() / 3);
      if (itemQuarter === currentQuarter && itemDate.getFullYear() === currentYear) {
        stats.valorTrimestre += itemValue;
      }
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

  // Converter valor string para número
  parseValueToNumber(valueString) {
    if (!valueString || valueString === 'Não informado') {
      return 0;
    }
    
    // Remove símbolos de moeda e espaços, converte vírgulas para pontos
    const cleanValue = valueString.replace(/[$\s,]/g, '');
    const numericValue = parseFloat(cleanValue);
    
    return isNaN(numericValue) ? 0 : numericValue;
  }
}

export default new AzureDevOpsService();

