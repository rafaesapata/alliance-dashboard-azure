import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import EnvDebugPanel from './EnvDebugPanel';
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
  Settings
} from 'lucide-react';
import azureService from '../lib/azureService';
import { mockWorkItems, getMockStats } from '../lib/mockData';

const Dashboard = () => {
  const [workItems, setWorkItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [usingMockData, setUsingMockData] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    loadWorkItems();
    // Atualizar a cada 5 minutos
    const interval = setInterval(loadWorkItems, 5 * 60 * 1000);
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
      'New': 'bg-blue-500',
      'Active': 'bg-yellow-500',
      'Resolved': 'bg-green-500',
      'Closed': 'bg-gray-500',
      'Done': 'bg-green-600',
      'In Progress': 'bg-orange-500',
      'To Do': 'bg-blue-400'
    };
    return stateColors[state] || 'bg-gray-400';
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

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="dashboard-title">
                Alliance Dashboard Azure
              </h1>
              <div className="dashboard-status">
                <p className="dashboard-subtitle">
                  Work Items - AWS Partnership
                </p>
                {usingMockData && (
                  <div className="status-badge demo">
                    <WifiOff className="w-4 h-4" />
                    Modo Demonstração
                  </div>
                )}
                {!usingMockData && (
                  <div className="status-badge connected">
                    <Wifi className="w-4 h-4" />
                    Conectado
                  </div>
                )}
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="debug-button"
                >
                  <Settings className="w-4 h-4" />
                  <span>Debug</span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </div>
              {loading && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  Atualizando...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Debug */}
        {showDebug && <EnvDebugPanel />}

        {/* Estatísticas Principais */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-title">Total de Items</div>
              <Activity className="stat-card-icon" />
            </div>
            <div className="stat-card-value">{stats?.total || 0}</div>
            <div className="stat-card-description">Work items ativos</div>
          </div>

          <div className="stat-card orange">
            <div className="stat-card-header">
              <div className="stat-card-title">Em Progresso</div>
              <Clock className="stat-card-icon" />
            </div>
            <div className="stat-card-value">
              {(stats?.byState['Active'] || 0) + (stats?.byState['In Progress'] || 0)}
            </div>
            <div className="stat-card-description">Items em desenvolvimento</div>
          </div>

          <div className="stat-card green">
            <div className="stat-card-header">
              <div className="stat-card-title">Concluídos</div>
              <CheckCircle className="stat-card-icon" />
            </div>
            <div className="stat-card-value">
              {(stats?.byState['Done'] || 0) + (stats?.byState['Closed'] || 0)}
            </div>
            <div className="stat-card-description">Items finalizados</div>
          </div>
        </div>

        {/* Gráficos e Listas */}
        <div className="content-grid">
          {/* Status Distribution */}
          <div className="content-section">
            <div className="section-title">
              <TrendingUp className="section-icon" />
              Distribuição por Status
            </div>
            <div className="space-y-6">
              {stats && Object.entries(stats.byState).map(([state, count]) => (
                <div key={state} className="progress-container">
                  <div className="progress-label">
                    <span>{state}</span>
                    <span>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(count / Math.max(...Object.values(stats.byState))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Items */}
          <div className="content-section">
            <div className="section-title">
              <Clock className="section-icon" />
              Items Recentes
            </div>
            <div className="work-items-list">
              {stats?.recentItems?.slice(0, 5).map((item) => (
                <div key={item.id} className="work-item">
                  <div className="work-item-header">
                    <div className="work-item-id">#{item.id}</div>
                    <div className={`status-badge ${getStateColor(item.state)}`}>
                      {item.state}
                    </div>
                  </div>
                  <div className="work-item-title">{item.title}</div>
                  <div className="work-item-meta">
                    <div className="flex items-center justify-between mb-2">
                      <span><strong>Responsável:</strong> {item.assignedTo}</span>
                      <span><strong>Cliente:</strong> {item.cliente}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span><strong>Valor:</strong> <span className="text-green-600 font-semibold">{item.valor}</span></span>
                      <span><strong>Cash Claim:</strong> <span className="text-blue-600 font-semibold">{item.cashClaim}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div>
          <Card className="bg-white tv-card">
            <CardHeader>
              <CardTitle className="flex items-center tv-text-lg">
                <Users className="tv-icon-lg mr-3" />
                Performance da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="tv-grid-3 grid tv-gap">
                {stats && Object.entries(stats.byAssignee)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([assignee, count]) => (
                  <div key={assignee} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium tv-text-base">{assignee}</p>
                      <p className="tv-text-sm text-gray-500">{count} work items</p>
                    </div>
                    <div className="text-right">
                      <div className="tv-text-lg font-bold text-blue-600">{count}</div>
                      <div className="w-20 mt-2">
                        <Progress 
                          value={(count / Math.max(...Object.values(stats.byAssignee))) * 100} 
                          className="tv-progress"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

