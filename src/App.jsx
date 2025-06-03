import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import UDSHeader from './components/UDSHeader';
import EnvDebugPanel from './components/EnvDebugPanel';
import { validateConfig } from './lib/azureConfig';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import './App.css';

function App() {
  const [configValid, setConfigValid] = useState(false);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    try {
      validateConfig();
      setConfigValid(true);
    } catch (error) {
      setConfigError(error.message);
      setConfigValid(false);
    }
  }, []);

  if (!configValid) {
    return (
      <>
        <UDSHeader />
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Painel de Debug */}
            <EnvDebugPanel />
          
          {/* Card de Erro */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Configuração Incompleta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">{configError}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Configuração Necessária no AWS Amplify
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      Configure as seguintes variáveis de ambiente no console do AWS Amplify:
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1 font-mono">
                      <li>• VITE_ALLIANCE_AZURE_API_TOKEN</li>
                      <li>• VITE_ALLIANCE_AZURE_WORKSPACE_URL</li>
                      <li>• VITE_ALLIANCE_AZURE_ORGANIZATION</li>
                    </ul>
                    <p className="text-xs text-yellow-600 mt-2">
                      ⚠️ Após configurar, faça um novo deploy no Amplify.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <UDSHeader />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Dashboard />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;

