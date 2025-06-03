import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import azureService from '../lib/azureService';

const ApiDebugPanel = () => {
  const [testing, setTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [areaPathResult, setAreaPathResult] = useState(null);
  const [workItemsResult, setWorkItemsResult] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    setConnectionResult(null);
    setAreaPathResult(null);
    setWorkItemsResult(null);

    try {
      // Teste 1: Conexão básica
      console.log('🧪 Iniciando teste de conexão...');
      const connResult = await azureService.testConnection();
      setConnectionResult(connResult);

      if (connResult.success) {
        // Teste 2: Verificar Area Path
        console.log('🧪 Testando Area Path...');
        const areaResult = await azureService.checkAreaPath();
        setAreaPathResult(areaResult);

        // Teste 3: Buscar Work Items
        console.log('🧪 Testando busca de work items...');
        try {
          const workItems = await azureService.getWorkItemsByAreaPath();
          setWorkItemsResult({
            success: true,
            count: workItems.length,
            items: workItems.slice(0, 3) // Primeiros 3 para debug
          });
        } catch (error) {
          setWorkItemsResult({
            success: false,
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error('Erro no teste:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (success) => {
    if (success === null) return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    return success ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (success) => {
    if (success === null) return <Badge variant="secondary">Aguardando</Badge>;
    return success ? 
      <Badge className="bg-green-500 text-white">Sucesso</Badge> : 
      <Badge className="bg-red-500 text-white">Erro</Badge>;
  };

  return (
    <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-800">
          🔬 Debug - API Azure DevOps
          <Button
            onClick={testConnection}
            disabled={testing}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{testing ? 'Testando...' : 'Testar API'}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Teste 1: Conexão */}
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex items-center space-x-3">
              {getStatusIcon(connectionResult?.success)}
              <span className="font-medium">1. Conexão com Azure DevOps</span>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(connectionResult?.success)}
              {connectionResult?.status && (
                <span className="text-sm text-gray-600">Status: {connectionResult.status}</span>
              )}
            </div>
          </div>
          
          {connectionResult && !connectionResult.success && (
            <div className="ml-6 p-3 bg-red-50 border border-red-200 rounded text-sm">
              <strong>Erro:</strong> {connectionResult.message}
            </div>
          )}

          {connectionResult?.success && connectionResult.data && (
            <div className="ml-6 p-3 bg-green-50 border border-green-200 rounded text-sm">
              <strong>✅ Conectado!</strong> {connectionResult.data.count} projetos encontrados
            </div>
          )}

          {/* Teste 2: Area Path */}
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex items-center space-x-3">
              {getStatusIcon(areaPathResult?.exists)}
              <span className="font-medium">2. Verificação da Area Path</span>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(areaPathResult?.exists)}
            </div>
          </div>

          {areaPathResult && !areaPathResult.exists && (
            <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <strong>⚠️ Area Path não encontrada:</strong> "AWS Partnership" pode não existir no projeto
            </div>
          )}

          {/* Teste 3: Work Items */}
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex items-center space-x-3">
              {getStatusIcon(workItemsResult?.success)}
              <span className="font-medium">3. Busca de Work Items</span>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(workItemsResult?.success)}
              {workItemsResult?.count !== undefined && (
                <span className="text-sm text-gray-600">{workItemsResult.count} items</span>
              )}
            </div>
          </div>

          {workItemsResult && !workItemsResult.success && (
            <div className="ml-6 p-3 bg-red-50 border border-red-200 rounded text-sm">
              <strong>Erro:</strong> {workItemsResult.error}
            </div>
          )}

          {workItemsResult?.success && workItemsResult.count === 0 && (
            <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <strong>⚠️ Nenhum work item encontrado</strong> na Area Path "AWS Partnership"
            </div>
          )}

          {workItemsResult?.success && workItemsResult.count > 0 && (
            <div className="ml-6 p-3 bg-green-50 border border-green-200 rounded text-sm">
              <strong>✅ {workItemsResult.count} work items encontrados!</strong>
              <div className="mt-2 space-y-1">
                {workItemsResult.items.map(item => (
                  <div key={item.id} className="text-xs text-gray-600">
                    #{item.id}: {item.title} ({item.state})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>💡 Como interpretar:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• <strong>Teste 1 falha:</strong> Problema de autenticação ou URL</li>
            <li>• <strong>Teste 2 falha:</strong> Area Path "AWS Partnership" não existe</li>
            <li>• <strong>Teste 3 falha:</strong> Erro na query ou permissões</li>
            <li>• <strong>0 work items:</strong> Area Path existe mas está vazia</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiDebugPanel;

