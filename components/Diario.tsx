'use client';

import { useState, useEffect } from 'react';
import { EntradaDiario, Alimento, Refeicao, MacroNutrientes } from '@/types';
import { storage } from '@/lib/storage';
import { multiplicarMacros, formatarMacros } from '@/lib/utils';

export default function Diario() {
  const [descricao, setDescricao] = useState('');
  const [estimando, setEstimando] = useState(false);
  const [entradasHoje, setEntradasHoje] = useState<EntradaDiario[]>([]);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [mostrarAdicionar, setMostrarAdicionar] = useState(false);
  const [tipoAdicionar, setTipoAdicionar] = useState<'alimento' | 'refeicao'>('alimento');
  const [itemSelecionado, setItemSelecionado] = useState<string>('');
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const hoje = new Date().toISOString().split('T')[0];
    setEntradasHoje(storage.diario.getByDate(hoje));
    setAlimentos(storage.alimentos.getAll());
    setRefeicoes(storage.refeicoes.getAll());
  };

  const estimarMacros = async () => {
    if (!descricao.trim()) return;

    setEstimando(true);
    try {
      const response = await fetch('/api/estimate-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao }),
      });

      if (!response.ok) {
        alert('Erro ao estimar macros. Verifique se a API key do OpenAI está configurada.');
        return;
      }

      const { macros, porcao } = await response.json();

      // Criar alimento temporário e adicionar ao diário
      const alimentoTemp: Alimento = {
        id: `temp-${Date.now()}`,
        nome: descricao,
        porcao,
        macros,
        criadoEm: new Date().toISOString(),
      };

      const entrada: EntradaDiario = {
        id: `entrada-${Date.now()}`,
        tipo: 'alimento',
        itemId: alimentoTemp.id,
        quantidade: 1,
        data: new Date().toISOString(),
        macros,
      };

      storage.diario.add(entrada);
      setDescricao('');
      carregarDados();
    } catch (error) {
      console.error(error);
      alert('Erro ao estimar macros');
    } finally {
      setEstimando(false);
    }
  };

  const adicionarItem = () => {
    if (!itemSelecionado || quantidade <= 0) return;

    let macros: MacroNutrientes;
    let nome: string;

    if (tipoAdicionar === 'alimento') {
      const alimento = alimentos.find(a => a.id === itemSelecionado);
      if (!alimento) return;
      macros = multiplicarMacros(alimento.macros, quantidade);
      nome = alimento.nome;
    } else {
      const refeicao = refeicoes.find(r => r.id === itemSelecionado);
      if (!refeicao) return;
      macros = multiplicarMacros(refeicao.macros, quantidade);
      nome = refeicao.nome;
    }

    const entrada: EntradaDiario = {
      id: `entrada-${Date.now()}`,
      tipo: tipoAdicionar,
      itemId: itemSelecionado,
      quantidade,
      data: new Date().toISOString(),
      macros,
    };

    storage.diario.add(entrada);
    setMostrarAdicionar(false);
    setItemSelecionado('');
    setQuantidade(1);
    carregarDados();
  };

  const deletarEntrada = (id: string) => {
    storage.diario.delete(id);
    carregarDados();
  };

  const totalMacros = entradasHoje.reduce(
    (acc, entrada) => ({
      calorias: acc.calorias + entrada.macros.calorias,
      proteinas: acc.proteinas + entrada.macros.proteinas,
      carboidratos: acc.carboidratos + entrada.macros.carboidratos,
      gorduras: acc.gorduras + entrada.macros.gorduras,
    }),
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estimador de Macros</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !estimando && estimarMacros()}
            placeholder="Descreva o que você comeu (ex: '1 prato de arroz com feijão e frango grelhado')"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={estimando}
          />
          <button
            onClick={estimarMacros}
            disabled={estimando || !descricao.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {estimando ? 'Estimando...' : 'Estimar'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Use IA para estimar automaticamente os macros do que você comeu
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Diário de Hoje</h2>
          <button
            onClick={() => setMostrarAdicionar(!mostrarAdicionar)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {mostrarAdicionar ? 'Cancelar' : '+ Adicionar'}
          </button>
        </div>

        {mostrarAdicionar && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setTipoAdicionar('alimento')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tipoAdicionar === 'alimento'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                Alimento
              </button>
              <button
                onClick={() => setTipoAdicionar('refeicao')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tipoAdicionar === 'refeicao'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                Refeição
              </button>
            </div>

            <select
              value={itemSelecionado}
              onChange={(e) => setItemSelecionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione {tipoAdicionar === 'alimento' ? 'um alimento' : 'uma refeição'}</option>
              {(tipoAdicionar === 'alimento' ? alimentos : refeicoes).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(parseFloat(e.target.value) || 1)}
                min="0.1"
                step="0.1"
                placeholder="Quantidade"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={adicionarItem}
                disabled={!itemSelecionado}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        {entradasHoje.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma entrada no diário hoje</p>
        ) : (
          <div className="space-y-3">
            {entradasHoje.map((entrada) => {
              const item = entrada.tipo === 'alimento'
                ? alimentos.find(a => a.id === entrada.itemId)
                : refeicoes.find(r => r.id === entrada.itemId);
              const nome = item?.nome || 'Item removido';

              return (
                <div
                  key={entrada.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{nome}</p>
                    <p className="text-sm text-gray-600">
                      {entrada.quantidade}x • {formatarMacros(entrada.macros)}
                    </p>
                  </div>
                  <button
                    onClick={() => deletarEntrada(entrada.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {entradasHoje.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total do Dia</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Calorias</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(totalMacros.calorias)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Proteínas</p>
              <p className="text-2xl font-bold text-gray-900">{totalMacros.proteinas.toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Carboidratos</p>
              <p className="text-2xl font-bold text-gray-900">{totalMacros.carboidratos.toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gorduras</p>
              <p className="text-2xl font-bold text-gray-900">{totalMacros.gorduras.toFixed(1)}g</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
