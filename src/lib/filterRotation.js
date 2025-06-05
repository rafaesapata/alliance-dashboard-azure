/**
 * Sistema de rotação cíclica de filtros de área
 * 
 * Este módulo implementa um sistema que permite alternar entre diferentes
 * filtros de área a cada recarregamento da página, de forma cíclica.
 * 
 * v1.0.28
 */

// Chave para armazenar o índice do filtro atual no localStorage
const FILTER_INDEX_KEY = 'alliance_current_filter_index';

/**
 * Obtém o índice do filtro atual do localStorage
 * @returns {number} Índice do filtro atual
 */
export const getCurrentFilterIndex = () => {
  const storedIndex = localStorage.getItem(FILTER_INDEX_KEY);
  return storedIndex !== null ? parseInt(storedIndex, 10) : 0;
};

/**
 * Avança para o próximo filtro e salva o novo índice no localStorage
 * @param {number} totalFilters - Número total de filtros disponíveis
 * @returns {number} Novo índice do filtro
 */
export const advanceToNextFilter = (totalFilters) => {
  if (!totalFilters || totalFilters <= 1) return 0;
  
  const currentIndex = getCurrentFilterIndex();
  const nextIndex = (currentIndex + 1) % totalFilters;
  
  localStorage.setItem(FILTER_INDEX_KEY, nextIndex.toString());
  console.log(`🔄 Avançando filtro: ${currentIndex} -> ${nextIndex} (total: ${totalFilters})`);
  
  return nextIndex;
};

/**
 * Obtém o filtro atual com base no índice armazenado
 * @param {string[]} filters - Array de filtros disponíveis
 * @returns {string} Filtro atual
 */
export const getCurrentFilter = (filters) => {
  if (!filters || filters.length === 0) return '';
  
  // Se houver apenas um filtro, retorna ele diretamente
  if (filters.length === 1) return filters[0];
  
  const currentIndex = getCurrentFilterIndex();
  const validIndex = currentIndex % filters.length;
  
  console.log(`🔍 Usando filtro ${validIndex + 1} de ${filters.length}: "${filters[validIndex]}"`);
  return filters[validIndex];
};

/**
 * Inicializa o sistema de rotação de filtros
 * @param {string[]} filters - Array de filtros disponíveis
 * @returns {string} Filtro atual a ser usado
 */
export const initializeFilterRotation = (filters) => {
  if (!filters || filters.length === 0) {
    console.warn('⚠️ Nenhum filtro disponível para rotação');
    return '';
  }
  
  console.log(`🔄 Iniciando rotação de filtros com ${filters.length} opções:`, filters);
  
  // Se for a primeira vez (ou após limpar o localStorage),
  // começa do primeiro filtro
  if (localStorage.getItem(FILTER_INDEX_KEY) === null) {
    localStorage.setItem(FILTER_INDEX_KEY, '0');
    console.log(`🔄 Iniciando rotação de filtros com índice 0`);
  }
  
  return getCurrentFilter(filters);
};

/**
 * Prepara o sistema para o próximo recarregamento
 * @param {string[]} filters - Array de filtros disponíveis
 */
export const prepareForNextReload = (filters) => {
  if (!filters || filters.length <= 1) return;
  
  advanceToNextFilter(filters.length);
  console.log('🔄 Sistema preparado para próximo recarregamento');
};

