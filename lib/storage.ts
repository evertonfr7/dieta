import { Alimento, Refeicao, EntradaDiario } from '@/types';

const STORAGE_KEYS = {
  alimentos: 'dieta_alimentos',
  refeicoes: 'dieta_refeicoes',
  diario: 'dieta_diario',
} as const;

export const storage = {
  alimentos: {
    getAll: (): Alimento[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.alimentos);
      return data ? JSON.parse(data) : [];
    },
    save: (alimento: Alimento): void => {
      const alimentos = storage.alimentos.getAll();
      const index = alimentos.findIndex(a => a.id === alimento.id);
      if (index >= 0) {
        alimentos[index] = alimento;
      } else {
        alimentos.push(alimento);
      }
      localStorage.setItem(STORAGE_KEYS.alimentos, JSON.stringify(alimentos));
    },
    delete: (id: string): void => {
      const alimentos = storage.alimentos.getAll();
      const filtered = alimentos.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.alimentos, JSON.stringify(filtered));
    },
  },
  refeicoes: {
    getAll: (): Refeicao[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.refeicoes);
      return data ? JSON.parse(data) : [];
    },
    save: (refeicao: Refeicao): void => {
      const refeicoes = storage.refeicoes.getAll();
      const index = refeicoes.findIndex(r => r.id === refeicao.id);
      if (index >= 0) {
        refeicoes[index] = refeicao;
      } else {
        refeicoes.push(refeicao);
      }
      localStorage.setItem(STORAGE_KEYS.refeicoes, JSON.stringify(refeicoes));
    },
    delete: (id: string): void => {
      const refeicoes = storage.refeicoes.getAll();
      const filtered = refeicoes.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.refeicoes, JSON.stringify(filtered));
    },
  },
  diario: {
    getAll: (): EntradaDiario[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.diario);
      return data ? JSON.parse(data) : [];
    },
    getByDate: (date: string): EntradaDiario[] => {
      return storage.diario.getAll().filter(e => e.data.startsWith(date));
    },
    add: (entrada: EntradaDiario): void => {
      const entradas = storage.diario.getAll();
      entradas.push(entrada);
      localStorage.setItem(STORAGE_KEYS.diario, JSON.stringify(entradas));
    },
    delete: (id: string): void => {
      const entradas = storage.diario.getAll();
      const filtered = entradas.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.diario, JSON.stringify(filtered));
    },
  },
};
