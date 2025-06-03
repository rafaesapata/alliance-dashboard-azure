// Dados de demonstração para o dashboard
export const mockWorkItems = [
  {
    id: 12345,
    title: "Implementar autenticação SSO para AWS Partnership",
    state: "Active",
    workItemType: "User Story",
    assignedTo: "João Silva",
    createdDate: new Date("2025-06-01"),
    areaPath: "AWS Partnership",
    priority: "High",
    tags: "authentication, aws, sso",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12345",
    valor: "$45,000.00",
    cliente: "Petrobras",
    cashClaim: "$15,000.00"
  },
  {
    id: 12346,
    title: "Corrigir bug na integração com AWS Lambda",
    state: "In Progress",
    workItemType: "Bug",
    assignedTo: "Maria Santos",
    createdDate: new Date("2025-05-30"),
    areaPath: "AWS Partnership",
    priority: "Critical",
    tags: "bug, aws, lambda",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12346",
    valor: "$12,500.00",
    cliente: "Vale",
    cashClaim: "$8,000.00"
  },
  {
    id: 12347,
    title: "Documentação da API AWS Partnership",
    state: "Done",
    workItemType: "Task",
    assignedTo: "Pedro Costa",
    createdDate: new Date("2025-05-28"),
    areaPath: "AWS Partnership",
    priority: "Medium",
    tags: "documentation, api",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12347",
    valor: "$8,000.00",
    cliente: "Banco do Brasil",
    cashClaim: "$3,200.00"
  },
  {
    id: 12348,
    title: "Configurar monitoramento CloudWatch",
    state: "New",
    workItemType: "Feature",
    assignedTo: "Ana Oliveira",
    createdDate: new Date("2025-05-25"),
    areaPath: "AWS Partnership",
    priority: "Low",
    tags: "monitoring, cloudwatch, aws",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12348",
    valor: "$22,000.00",
    cliente: "Itaú Unibanco",
    cashClaim: "$11,000.00"
  },
  {
    id: 12349,
    title: "Otimizar performance do dashboard",
    state: "Active",
    workItemType: "Task",
    assignedTo: "Carlos Ferreira",
    createdDate: new Date("2025-05-20"),
    areaPath: "AWS Partnership",
    priority: "Medium",
    tags: "performance, optimization",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12349",
    valor: "$18,500.00",
    cliente: "Bradesco",
    cashClaim: "$7,400.00"
  },
  {
    id: 12350,
    title: "Implementar backup automático S3",
    state: "Resolved",
    workItemType: "Epic",
    assignedTo: "Luiza Rodrigues",
    createdDate: new Date("2025-05-15"),
    areaPath: "AWS Partnership",
    priority: "High",
    tags: "backup, s3, automation",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12350",
    valor: "$65,000.00",
    cliente: "Caixa Econômica Federal",
    cashClaim: "$26,000.00"
  },
  {
    id: 12351,
    title: "Teste de carga para API Gateway",
    state: "Closed",
    workItemType: "Task",
    assignedTo: "Roberto Lima",
    createdDate: new Date("2025-05-10"),
    areaPath: "AWS Partnership",
    priority: "Medium",
    tags: "testing, api-gateway, performance",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12351",
    valor: "$14,000.00",
    cliente: "Santander",
    cashClaim: "$5,600.00"
  },
  {
    id: 12352,
    title: "Configurar alertas de segurança",
    state: "In Progress",
    workItemType: "User Story",
    assignedTo: "Fernanda Alves",
    createdDate: new Date("2025-05-05"),
    areaPath: "AWS Partnership",
    priority: "Critical",
    tags: "security, alerts, monitoring",
    url: "https://dev.azure.com/uds-tecnologia/_workitems/edit/12352",
    valor: "$35,000.00",
    cliente: "Magazine Luiza",
    cashClaim: "$14,000.00"
  }
];

export const getMockStats = (workItems) => {
  const stats = {
    total: workItems.length,
    byState: {},
    byType: {},
    byAssignee: {},
    recentItems: workItems.slice(0, 5),
    totalValue: workItems.reduce((sum, item) => {
      const value = parseFloat(item.valor.replace(/[$\s,]/g, '')) || 0;
      return sum + value;
    }, 0),
    totalCashClaim: workItems.reduce((sum, item) => {
      const cashClaim = parseFloat(item.cashClaim.replace(/[$\s,]/g, '')) || 0;
      return sum + cashClaim;
    }, 0)
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
};

