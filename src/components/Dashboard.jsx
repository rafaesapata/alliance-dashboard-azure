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
  WifiOff
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

        {/* Items Recentes - Layout em Duas Colunas */}
        <div className="recent-items-section">
          <div className="section-title mb-8">
            <Clock className="section-icon" />
            Items Recentes
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats?.recentItems?.slice(0, 10).map((item) => (
              <div key={item.id} className="recent-item-card">
                <div className="recent-item-header">
                  <div className="flex items-center justify-between mb-3">
                    <div className="recent-item-id">#{item.id}</div>
                    <div className={`recent-status-badge ${getStateColor(item.state)}`}>
                      {item.state}
                    </div>
                  </div>
                  <div className="recent-item-type">
                    {getTypeIcon(item.type)}
                    <span className="ml-2">{item.type}</span>
                  </div>
                </div>
                
                <div className="recent-item-title">{item.title}</div>
                
                <div className="recent-item-details">
                  <div className="detail-row">
                    <span className="detail-label">Responsável:</span>
                    <span className="detail-value">{item.assignedTo}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Cliente:</span>
                    <span className="detail-value">{item.cliente}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Valor:</span>
                    <span className="detail-value-money green">{item.valor}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Cash Claim:</span>
                    <span className="detail-value-money blue">{item.cashClaim}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Criado:</span>
                    <span className="detail-value">{item.createdDate}</span>
                  </div>
                  
                  {item.modifiedDate && (
                    <div className="detail-row">
                      <span className="detail-label">Modificado:</span>
                      <span className="detail-value">{item.modifiedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Dashboard;

