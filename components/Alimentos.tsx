'use client';

import { useState, useEffect } from 'react';
import { Alimento, MacroNutrientes } from '@/types';
import { storage } from '@/lib/storage';
import { formatarMacros } from '@/lib/utils';

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Alimento | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    porcao: '',
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
  });
  const [estimando, setEstimando] = useState(false);

  useEffect(() => {
    carregarAlimentos();
  }, []);

  const carregarAlimentos = () => {
    setAlimentos(storage.alimentos.getAll());
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      porcao: '',
      calorias: '',
      proteinas: '',
      carboidratos: '',
      gorduras: '',
    });
    setEditando(null);
    setMostrarForm(false);
  };

  const estimarMacros = async () => {
    if (!formData.nome.trim()) {
      alert('Digite o nome do alimento primeiro');
      return;
    }

    setEstimando(true);
    try {
      const response = await fetch('/api/estimate-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: formData.nome }),
      });

      if (!response.ok) {
        alert('Erro ao estimar macros');
        return;
      }

      const { macros, porcao } = await response.json();
      setFormData({
        ...formData,
        porcao: porcao || formData.porcao,
        calorias: macros.calorias.toString(),
        proteinas: macros.proteinas.toString(),
        carboidratos: macros.carboidratos.toString(),
        gorduras: macros.gorduras.toString(),
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao estimar macros');
    } finally {
      setEstimando(false);
    }
  };

  const salvarAlimento = () => {
    if (!formData.nome.trim() || !formData.porcao.trim()) {
      alert('Preencha nome e porção');
      return;
    }

    const macros: MacroNutrientes = {
      calorias: parseFloat(formData.calorias) || 0,
      proteinas: parseFloat(formData.proteinas) || 0,
      carboidratos: parseFloat(formData.carboidratos) || 0,
      gorduras: parseFloat(formData.gorduras) || 0,
    };

    const alimento: Alimento = editando
      ? { ...editando, nome: formData.nome, porcao: formData.porcao, macros }
      : {
          id: `alimento-${Date.now()}`,
          nome: formData.nome,
          porcao: formData.porcao,
          macros,
          criadoEm: new Date().toISOString(),
        };

    storage.alimentos.save(alimento);
    resetForm();
    carregarAlimentos();
  };

  const editarAlimento = (alimento: Alimento) => {
    setEditando(alimento);
    setFormData({
      nome: alimento.nome,
      porcao: alimento.porcao,
      calorias: alimento.macros.calorias.toString(),
      proteinas: alimento.macros.proteinas.toString(),
      carboidratos: alimento.macros.carboidratos.toString(),
      gorduras: alimento.macros.gorduras.toString(),
    });
    setMostrarForm(true);
  };

  const deletarAlimento = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este alimento?')) {
      storage.alimentos.delete(id);
      carregarAlimentos();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Meus Alimentos</h2>
        <button
          onClick={() => {
            resetForm();
            setMostrarForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Novo Alimento
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editando ? 'Editar Alimento' : 'Novo Alimento'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Peito de frango grelhado"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porção</label>
              <input
                type="text"
                value={formData.porcao}
                onChange={(e) => setFormData({ ...formData, porcao: e.target.value })}
                placeholder="Ex: 100g, 1 unidade"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={estimarMacros}
              disabled={estimando || !formData.nome.trim()}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {estimando ? 'Estimando...' : '🤖 Estimar macros com IA'}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calorias</label>
                <input
                  type="number"
                  value={formData.calorias}
                  onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proteínas (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.proteinas}
                  onChange={(e) => setFormData({ ...formData, proteinas: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carboidratos (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carboidratos}
                  onChange={(e) => setFormData({ ...formData, carboidratos: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gorduras (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gorduras}
                  onChange={(e) => setFormData({ ...formData, gorduras: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={salvarAlimento}
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

      {alimentos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Nenhum alimento cadastrado ainda</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alimentos.map((alimento) => (
            <div
              key={alimento.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{alimento.nome}</h3>
                  <p className="text-sm text-gray-600 mb-2">Porção: {alimento.porcao}</p>
                  <p className="text-sm text-gray-700">{formatarMacros(alimento.macros)}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editarAlimento(alimento)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletarAlimento(alimento.id)}
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
