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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 tv-padding">
      <div className="tv-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="tv-title text-gray-900 mb-4">
                Alliance Dashboard Azure
              </h1>
              <div className="flex items-center space-x-6">
                <p className="text-gray-600 tv-subtitle">
                  Work Items - AWS Partnership
                </p>
                {usingMockData && (
                  <Badge variant="secondary" className="tv-badge bg-yellow-100 text-yellow-800 border-yellow-300">
                    <WifiOff className="tv-icon mr-2" />
                    Modo Demonstração
                  </Badge>
                )}
                {!usingMockData && (
                  <Badge variant="secondary" className="tv-badge bg-green-100 text-green-800 border-green-300">
                    <Wifi className="tv-icon mr-2" />
                    Conectado
                  </Badge>
                )}
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center space-x-2 text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                >
                  <Settings className="tv-icon" />
                  <span>Debug</span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center tv-text-base text-gray-500 mb-2">
                <Calendar className="tv-icon mr-2" />
                Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </div>
              {loading && (
                <div className="flex items-center tv-text-base text-blue-600">
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
        <div className="tv-grid-4 grid tv-gap-lg mb-12">
          <Card className="bg-white tv-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="tv-card-title">Total de Items</CardTitle>
              <Activity className="tv-icon-lg text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="tv-metric text-blue-600">{stats?.total || 0}</div>
              <p className="tv-text-sm text-gray-500 mt-2">Work items ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-white tv-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="tv-card-title">Em Progresso</CardTitle>
              <Clock className="tv-icon-lg text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="tv-metric text-orange-600">
                {(stats?.byState['Active'] || 0) + (stats?.byState['In Progress'] || 0)}
              </div>
              <p className="tv-text-sm text-gray-500 mt-2">Items em desenvolvimento</p>
            </CardContent>
          </Card>

          <Card className="bg-white tv-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="tv-card-title">Concluídos</CardTitle>
              <CheckCircle className="tv-icon-lg text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="tv-metric text-green-600">
                {(stats?.byState['Done'] || 0) + (stats?.byState['Closed'] || 0)}
              </div>
              <p className="tv-text-sm text-gray-500 mt-2">Items finalizados</p>
            </CardContent>
          </Card>

          <Card className="bg-white tv-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="tv-card-title">Bugs</CardTitle>
              <AlertCircle className="tv-icon-lg text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="tv-metric text-red-600">
                {stats?.byType['Bug'] || 0}
              </div>
              <p className="tv-text-sm text-gray-500 mt-2">Bugs reportados</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Listas */}
        <div className="tv-grid-2 grid tv-gap-lg mb-12">
          {/* Status Distribution */}
          <Card className="bg-white tv-card">
            <CardHeader>
              <CardTitle className="flex items-center tv-text-lg">
                <TrendingUp className="tv-icon-lg mr-3" />
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats && Object.entries(stats.byState).map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${getStateColor(state)} mr-4`}></div>
                      <span className="tv-text-base font-medium">{state}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="tv-text-base text-gray-600 font-semibold">{count}</span>
                      <div className="w-32">
                        <Progress 
                          value={(count / stats.total) * 100} 
                          className="tv-progress"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Items */}
          <Card className="bg-white tv-card">
            <CardHeader>
              <CardTitle className="flex items-center tv-text-lg">
                <Clock className="tv-icon-lg mr-3" />
                Items Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentItems?.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(item.workItemType)}
                      <div>
                        <p className="tv-text-base font-medium truncate max-w-md">
                          {item.title}
                        </p>
                        <p className="tv-text-sm text-gray-500">
                          #{item.id} • {item.assignedTo}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`tv-badge ${getStateColor(item.state)} text-white`}
                    >
                      {item.state}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

