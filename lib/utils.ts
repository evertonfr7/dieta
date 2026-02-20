import { MacroNutrientes, Alimento, Refeicao } from '@/types';

export function calcularMacrosRefeicao(
  alimentos: Alimento[],
  ingredientes: Array<{ alimentoId: string; quantidade: number }>
): MacroNutrientes {
  return ingredientes.reduce(
    (acc, ingrediente) => {
      const alimento = alimentos.find(a => a.id === ingrediente.alimentoId);
      if (!alimento) return acc;

      return {
        calorias: acc.calorias + alimento.macros.calorias * ingrediente.quantidade,
        proteinas: acc.proteinas + alimento.macros.proteinas * ingrediente.quantidade,
        carboidratos: acc.carboidratos + alimento.macros.carboidratos * ingrediente.quantidade,
        gorduras: acc.gorduras + alimento.macros.gorduras * ingrediente.quantidade,
      };
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );
}

export function multiplicarMacros(macros: MacroNutrientes, multiplicador: number): MacroNutrientes {
  return {
    calorias: Math.round(macros.calorias * multiplicador),
    proteinas: Math.round(macros.proteinas * multiplicador * 10) / 10,
    carboidratos: Math.round(macros.carboidratos * multiplicador * 10) / 10,
    gorduras: Math.round(macros.gorduras * multiplicador * 10) / 10,
  };
}

export function formatarMacros(macros: MacroNutrientes): string {
  return `${macros.calorias} kcal | P: ${macros.proteinas}g | C: ${macros.carboidratos}g | G: ${macros.gorduras}g`;
}
