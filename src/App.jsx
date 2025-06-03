import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import { validateConfig } from './lib/azureConfig';
import { AlertCircle, Settings } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-96">
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
                  <Settings className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Configuração Necessária
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      Verifique se as seguintes variáveis de ambiente estão configuradas no arquivo .env:
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• ALLIANCE_AZURE_API_TOKEN</li>
                      <li>• ALLIANCE_AZURE_WORKSPACE_URL</li>
                      <li>• ALLIANCE_AZURE_ORGANIZATION</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}

export default App;

