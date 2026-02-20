'use client';

import { useState, useEffect } from 'react';
import { Refeicao, Alimento, MacroNutrientes } from '@/types';
import { storage } from '@/lib/storage';
import { calcularMacrosRefeicao, formatarMacros } from '@/lib/utils';

export default function Refeicoes() {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Refeicao | null>(null);
  const [nomeRefeicao, setNomeRefeicao] = useState('');
  const [ingredientes, setIngredientes] = useState<Array<{ alimentoId: string; quantidade: number }>>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (ingredientes.length > 0 && alimentos.length > 0) {
      // Recalcular macros quando ingredientes mudarem
    }
  }, [ingredientes, alimentos]);

  const carregarDados = () => {
    setRefeicoes(storage.refeicoes.getAll());
    setAlimentos(storage.alimentos.getAll());
  };

  const resetForm = () => {
    setNomeRefeicao('');
    setIngredientes([]);
    setEditando(null);
    setMostrarForm(false);
  };

  const adicionarIngrediente = () => {
    if (alimentos.length === 0) {
      alert('Cadastre alimentos primeiro!');
      return;
    }
    setIngredientes([...ingredientes, { alimentoId: alimentos[0].id, quantidade: 1 }]);
  };

  const removerIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const atualizarIngrediente = (index: number, campo: 'alimentoId' | 'quantidade', valor: string | number) => {
    const novos = [...ingredientes];
    novos[index] = { ...novos[index], [campo]: valor };
    setIngredientes(novos);
  };

  const calcularMacros = (): MacroNutrientes => {
    if (ingredientes.length === 0 || alimentos.length === 0) {
      return { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
    }
    return calcularMacrosRefeicao(alimentos, ingredientes);
  };

  const salvarRefeicao = () => {
    if (!nomeRefeicao.trim()) {
      alert('Digite o nome da refeição');
      return;
    }

    if (ingredientes.length === 0) {
      alert('Adicione pelo menos um ingrediente');
      return;
    }

    const macros = calcularMacros();

    const refeicao: Refeicao = editando
      ? { ...editando, nome: nomeRefeicao, alimentos: ingredientes, macros }
      : {
          id: `refeicao-${Date.now()}`,
          nome: nomeRefeicao,
          alimentos: ingredientes,
          macros,
          criadoEm: new Date().toISOString(),
        };

    storage.refeicoes.save(refeicao);
    resetForm();
    carregarDados();
  };

  const editarRefeicao = (refeicao: Refeicao) => {
    setEditando(refeicao);
    setNomeRefeicao(refeicao.nome);
    setIngredientes(refeicao.alimentos);
    setMostrarForm(true);
  };

  const deletarRefeicao = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta refeição?')) {
      storage.refeicoes.delete(id);
      carregarDados();
    }
  };

  const macrosCalculados = calcularMacros();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Minhas Refeições</h2>
        <button
          onClick={() => {
            resetForm();
            setMostrarForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nova Refeição
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editando ? 'Editar Refeição' : 'Nova Refeição'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Refeição</label>
              <input
                type="text"
                value={nomeRefeicao}
                onChange={(e) => setNomeRefeicao(e.target.value)}
                placeholder="Ex: Almoço completo, Café da manhã"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Ingredientes</label>
                <button
                  onClick={adicionarIngrediente}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Adicionar ingrediente
                </button>
              </div>

              {alimentos.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Cadastre alimentos primeiro antes de criar uma refeição!
                  </p>
                </div>
              ) : ingredientes.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Nenhum ingrediente adicionado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ingredientes.map((ingrediente, index) => {
                    const alimento = alimentos.find(a => a.id === ingrediente.alimentoId);
                    return (
                      <div
                        key={index}
                        className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <select
                          value={ingrediente.alimentoId}
                          onChange={(e) => atualizarIngrediente(index, 'alimentoId', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          {alimentos.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nome} ({a.porcao})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={ingrediente.quantidade}
                          onChange={(e) =>
                            atualizarIngrediente(index, 'quantidade', parseFloat(e.target.value) || 1)
                          }
                          min="0.1"
                          step="0.1"
                          placeholder="Qtd"
                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <span className="text-sm text-gray-600">x</span>
                        <button
                          onClick={() => removerIngrediente(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {ingredientes.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Macros calculados:</p>
                  <p className="text-sm text-gray-700">{formatarMacros(macrosCalculados)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={salvarRefeicao}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Salvar
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {refeicoes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Nenhuma refeição cadastrada ainda</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {refeicoes.map((refeicao) => (
            <div
              key={refeicao.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{refeicao.nome}</h3>
                  <div className="space-y-1 mb-3">
                    {refeicao.alimentos.map((ing, idx) => {
                      const alimento = alimentos.find(a => a.id === ing.alimentoId);
                      return (
                        <p key={idx} className="text-sm text-gray-600">
                          • {alimento?.nome || 'Alimento removido'} ({ing.quantidade}x)
                        </p>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{formatarMacros(refeicao.macros)}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editarRefeicao(refeicao)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletarRefeicao(refeicao.id)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
