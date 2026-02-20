export interface MacroNutrientes {
  calorias: number;
  proteinas: number; // gramas
  carboidratos: number; // gramas
  gorduras: number; // gramas
}

export interface Alimento {
  id: string;
  nome: string;
  porcao: string; // ex: "100g", "1 unidade"
  macros: MacroNutrientes;
  criadoEm: string;
}

export interface Refeicao {
  id: string;
  nome: string;
  alimentos: Array<{
    alimentoId: string;
    quantidade: number; // multiplicador da porção padrão
  }>;
  macros: MacroNutrientes; // calculado automaticamente
  criadoEm: string;
}

export interface EntradaDiario {
  id: string;
  tipo: 'alimento' | 'refeicao';
  itemId: string; // id do alimento ou refeição
  quantidade: number;
  data: string; // ISO date string
  macros: MacroNutrientes;
}
