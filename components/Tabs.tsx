'use client';

import { useState } from 'react';
import Diario from './Diario';
import Alimentos from './Alimentos';
import Refeicoes from './Refeicoes';

type Tab = 'diario' | 'alimentos' | 'refeicoes';

export default function Tabs() {
  const [activeTab, setActiveTab] = useState<Tab>('diario');

  const tabs = [
    { id: 'diario' as Tab, label: 'Diário', icon: '📅' },
    { id: 'alimentos' as Tab, label: 'Alimentos', icon: '🍎' },
    { id: 'refeicoes' as Tab, label: 'Refeições', icon: '🍽️' },
  ];

  return (
    <div className="w-full">
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'diario' && <Diario />}
        {activeTab === 'alimentos' && <Alimentos />}
        {activeTab === 'refeicoes' && <Refeicoes />}
      </div>
    </div>
  );
}
