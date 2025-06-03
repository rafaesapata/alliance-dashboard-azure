import versionInfo from '../version.json';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-4 px-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <span className="font-semibold">Alliance Dashboard Azure</span>
          <span className="text-gray-400">|</span>
          <span className="text-blue-400">v{versionInfo.version}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">Build: {versionInfo.buildDate}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            © {currentYear} UDS Tecnologia
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">
            Azure DevOps Integration
          </span>
        </div>
      </div>
      
      <div className="container mx-auto mt-2 pt-2 border-t border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <span>
            Conectado ao workspace: {import.meta.env.VITE_ALLIANCE_AZURE_ORGANIZATION || 'uds-tecnologia'}
          </span>
          <span>
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

