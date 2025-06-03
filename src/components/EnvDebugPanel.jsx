import { debugEnvVars } from '../lib/azureConfig';
import ApiDebugPanel from './ApiDebugPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const EnvDebugPanel = () => {
  const [showValues, setShowValues] = useState(false);
  const envVars = debugEnvVars();
  
  const maskValue = (value) => {
    if (!value) return 'undefined';
    if (value === '') return 'empty string';
    if (!showValues && value.length > 10) {
      return value.substring(0, 10) + '...';
    }
    return value;
  };
  
  const getStatus = (value) => {
    if (value === undefined) return { color: 'bg-red-500', text: 'UNDEFINED' };
    if (value === '') return { color: 'bg-yellow-500', text: 'EMPTY' };
    return { color: 'bg-green-500', text: 'OK' };
  };

  return (
    <div className="space-y-6">
      {/* Painel de Variáveis de Ambiente */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-blue-800">
            🔍 Debug - Variáveis de Ambiente
            <button
              onClick={() => setShowValues(!showValues)}
              className="flex items-center space-x-2 text-sm bg-blue-600 text-white px-3 py-1 rounded"
            >
              {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showValues ? 'Ocultar' : 'Mostrar'} Valores</span>
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(envVars).map(([key, value]) => {
              const status = getStatus(value);
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${status.color} text-white`}>
                      {status.text}
                    </Badge>
                    <span className="font-mono text-sm font-medium">{key}</span>
                  </div>
                  <span className="font-mono text-sm text-gray-600 max-w-md truncate">
                    {maskValue(value)}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> Se alguma variável estiver UNDEFINED ou EMPTY, 
              verifique se ela foi configurada corretamente no AWS Amplify e se o deploy foi feito após a configuração.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Painel de Debug da API */}
      <ApiDebugPanel />
    </div>
  );
};

export default EnvDebugPanel;

