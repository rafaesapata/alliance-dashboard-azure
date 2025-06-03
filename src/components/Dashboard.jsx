import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  Wifi,
  WifiOff,
  DollarSign,
  BarChart3
} from 'lucide-react';
import azureService from '../lib/azureService';
import { mockWorkItems, getMockStats } from '../lib/mockData';
import '../styles/alliance-theme.css';

const Dashboard = () => {
  const [workItems, setWorkItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    loadWorkItems();
    // Atualizar a cada 60 segundos
    const interval = setInterval(loadWorkItems, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadWorkItems = async () => {
    try {
      setLoading(true);
      const items = await azureService.getWorkItemsByAreaPath();
      const statistics = azureService.getWorkItemStats(items);
      
      setWorkItems(items);
      setStats(statistics);
      setLastUpdate(new Date());
      setError(null);
      setUsingMockData(false);
    } catch (err) {
      console.warn('Erro ao conectar com Azure DevOps, usando dados de demonstração:', err);
      
      // Usar dados de demonstração em caso de erro
      const mockStats = getMockStats(mockWorkItems);
      setWorkItems(mockWorkItems);
      setStats(mockStats);
      setLastUpdate(new Date());
      setError(null);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state) => {
    const stateColors = {
      'New': 'new',
      'Active': 'active',
      'Resolved': 'done',
      'Closed': 'done',
      'Done': 'done',
      'In Progress': 'progress',
      'To Do': 'new'
    };
    return stateColors[state] || 'new';
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      'Bug': AlertCircle,
      'Task': CheckCircle,
      'User Story': Users,
      'Feature': Target,
      'Epic': TrendingUp
    };
    const Icon = typeIcons[type] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const formatCurrency = (value) => {
    if (typeof value === 'string' && value.includes('$')) {
      return value;
    }
    return `US$ ${value?.toLocaleString('pt-BR') || '0'},00`;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do Azure DevOps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Erro de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadWorkItems}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = stats?.total || 0;
  const inProgress = (stats?.byState['Active'] || 0) + (stats?.byState['In Progress'] || 0);
  const completed = (stats?.byState['Done'] || 0) + (stats?.byState['Closed'] || 0);
  const conversionRate = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Alliance */}
      <header className="alliance-header">
        <div className="alliance-header-content">
          <div className="alliance-header-left">
            <h1 className="alliance-title">Azure DevOps Dashboard</h1>
            <p className="alliance-subtitle">Última atualização: {lastUpdate.toLocaleString('pt-BR')}</p>
          </div>
          <div className="alliance-header-right">
            Powered by<br />UDS Tecnologia
          </div>
        </div>
      </header>

      {/* Container Principal */}
      <div className="alliance-container">
        {/* Cards Principais */}
        <div className="alliance-stats-grid">
          <div className="alliance-stat-card green alliance-animate">
            <div className="alliance-card-header">
              <h3 className="alliance-card-title">Work Items Ativos</h3>
              <TrendingUp className="alliance-card-icon" />
            </div>
            <div className="alliance-card-value green">{inProgress}</div>
            <p className="alliance-card-description">{formatCurrency(stats?.valorMes || 0)} em valor</p>
          </div>

          <div className="alliance-stat-card blue alliance-animate">
            <div className="alliance-card-header">
              <h3 className="alliance-card-title">Work Items Concluídos</h3>
              <CheckCircle className="alliance-card-icon" />
            </div>
            <div className="alliance-card-value blue">{completed}</div>
            <p className="alliance-card-description">{formatCurrency(stats?.valorTrimestre || 0)} em valor</p>
          </div>

          <div className="alliance-stat-card purple alliance-animate">
            <div className="alliance-card-header">
              <h3 className="alliance-card-title">Total de Work Items</h3>
              <DollarSign className="alliance-card-icon" />
            </div>
            <div className="alliance-card-value purple">{totalItems}</div>
            <p className="alliance-card-description">{formatCurrency(stats?.totalValue || 0)} valor total</p>
          </div>

          <div className="alliance-stat-card orange alliance-animate">
            <div className="alliance-card-header">
              <h3 className="alliance-card-title">Taxa de Conclusão</h3>
              <BarChart3 className="alliance-card-icon" />
            </div>
            <div className="alliance-card-value orange">{conversionRate}%</div>
            <p className="alliance-card-description">{completed} de {totalItems} concluídos</p>
          </div>
        </div>

        {/* Análises Mensal e Trimestral */}
        <div className="alliance-analysis-grid">
          <div className="alliance-analysis-card alliance-animate">
            <div className="alliance-analysis-header">
              <Calendar className="alliance-analysis-icon blue" />
              <div>
                <h3 className="alliance-analysis-title">Análise Mensal</h3>
                <p className="alliance-analysis-subtitle">Dados do mês atual</p>
              </div>
            </div>
            <div className="alliance-metrics">
              <div className="alliance-metric">
                <div className="alliance-metric-label">Meta de Work Items</div>
                <div className="alliance-metric-value green">
                  {Math.round((inProgress / Math.max(totalItems, 1)) * 100)}%
                </div>
                <div className="alliance-metric-description">
                  {inProgress} de {totalItems} (faltam {totalItems - inProgress})
                </div>
              </div>
              <div className="alliance-metric">
                <div className="alliance-metric-label">Meta de Valor</div>
                <div className="alliance-metric-value blue">
                  {stats?.valorMes ? Math.round((stats.valorMes / Math.max(stats.totalValue, 1)) * 100) : 0}%
                </div>
                <div className="alliance-metric-description">
                  {formatCurrency(stats?.valorMes || 0)} de {formatCurrency(stats?.totalValue || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="alliance-analysis-card alliance-animate">
            <div className="alliance-analysis-header">
              <Calendar className="alliance-analysis-icon purple" />
              <div>
                <h3 className="alliance-analysis-title">Análise Trimestral</h3>
                <p className="alliance-analysis-subtitle">Dados do trimestre atual</p>
              </div>
            </div>
            <div className="alliance-metrics">
              <div className="alliance-metric">
                <div className="alliance-metric-label">Meta de Work Items</div>
                <div className="alliance-metric-value green">
                  {Math.round((completed / Math.max(totalItems, 1)) * 100)}%
                </div>
                <div className="alliance-metric-description">
                  {completed} de {totalItems} (faltam {totalItems - completed})
                </div>
              </div>
              <div className="alliance-metric">
                <div className="alliance-metric-label">Meta de Valor</div>
                <div className="alliance-metric-value purple">
                  {stats?.valorTrimestre ? Math.round((stats.valorTrimestre / Math.max(stats.totalValue, 1)) * 100) : 0}%
                </div>
                <div className="alliance-metric-description">
                  {formatCurrency(stats?.valorTrimestre || 0)} de {formatCurrency(stats?.totalValue || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos Work Items */}
        <div className="alliance-recent-section alliance-animate">
          <div className="alliance-section-header">
            <h2 className="alliance-section-title">Últimos {stats?.recentItems?.length || 0} Work Items</h2>
            <p className="alliance-section-subtitle">Work items mais recentes ordenados por data de modificação</p>
          </div>
          
          <div className="alliance-recent-grid">
            {stats?.recentItems?.map((item) => (
              <div key={item.id} className="alliance-recent-card">
                <div className="alliance-recent-header">
                  <span className="alliance-recent-id">ID: {item.id}</span>
                  <span className={`alliance-recent-status ${getStateColor(item.state)}`}>
                    {item.state}
                  </span>
                </div>
                
                <div className="alliance-recent-value">{item.valor}</div>
                
                <div className="alliance-recent-details">
                  <div className="alliance-recent-detail">
                    <strong>Cliente:</strong> {item.cliente}
                  </div>
                  <div className="alliance-recent-detail">
                    <strong>Responsável:</strong> {item.assignedTo}
                  </div>
                  <div className="alliance-recent-detail">
                    <strong>Cash Claim:</strong> {item.cashClaim}
                  </div>
                  <div className="alliance-recent-detail">
                    <strong>Modificado:</strong> {item.modifiedDate || item.createdDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé Alliance */}
        <footer className="alliance-footer">
          <div className="alliance-footer-left">
            <div className="alliance-footer-text">© 2025 UDS Tecnologia. Todos os direitos reservados.</div>
            <div className="alliance-footer-text">
              Desenvolvido com React + Azure DevOps SDK | Dados em tempo real do Azure DevOps
            </div>
          </div>
          <div className="alliance-footer-right">
            <div className="alliance-footer-version">Versão: v1.0.9</div>
            <div className="alliance-footer-version">Build: {new Date().toLocaleDateString('pt-BR')}</div>
            <div className="alliance-footer-text">
              Status: {usingMockData ? '⚠️ Demonstração' : '✅ Conectado'}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;

