
import React, { useState } from 'react';
import { BudgetItem, QuantitativeLog } from '../types';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  budget: BudgetItem[];
  logs: QuantitativeLog[];
  setLogs: (logs: QuantitativeLog[]) => void;
  onNext: () => void;
}

const QuantitativeLogComponent: React.FC<Props> = ({ budget, logs, setLogs, onNext }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = Math.max(0, Number(value));
    
    const existingIndex = logs.findIndex(l => l.budgetItemId === itemId && l.month === selectedMonth);
    const newLogs = [...logs];

    if (existingIndex >= 0) {
      newLogs[existingIndex] = { ...newLogs[existingIndex], executedQuantity: numValue };
    } else {
      newLogs.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        month: selectedMonth,
        budgetItemId: itemId,
        executedQuantity: numValue
      });
    }
    setLogs(newLogs);
  };

  const getLog = (itemId: string) => logs.find(l => l.budgetItemId === itemId && l.month === selectedMonth);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-900">Etapa 7: Medição de Quantitativo (Mensal)</h2>
            <p className="text-teal-600 text-sm">Insira o quanto foi executado fisicamente de cada item em <strong>{selectedMonth}</strong>.</p>
          </div>
          
          <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 text-teal-600 hover:bg-white hover:shadow rounded transition" title="Mês Anterior">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 px-4 border-l border-r border-slate-200 mx-1">
              <Calendar size={18} className="text-teal-600" />
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-gray-900 font-bold w-36 text-center"
              />
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 text-teal-600 hover:bg-white hover:shadow rounded transition" title="Próximo Mês">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-teal-50 text-teal-800 font-medium border-b border-teal-200">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3 text-right">Qtd. Total Orçada</th>
                <th className="px-4 py-3 text-right text-green-700 bg-green-50 w-40">Qtd. Executada (Mês)</th>
                <th className="px-4 py-3 text-right text-teal-700">% Avanço Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-gray-900">
              {budget.map(item => {
                const log = getLog(item.id);
                const executed = log?.executedQuantity || 0;
                const percentage = item.quantity > 0 ? (executed / item.quantity) * 100 : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.code}</td>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right bg-green-50/30">
                      <div className="flex items-center justify-end gap-2">
                        <input 
                          type="number" 
                          min="0" 
                          value={executed} 
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-24 px-2 py-1 text-right bg-white border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:outline-none text-gray-900 font-bold"
                        />
                        <span className="text-gray-500 text-xs">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                        {percentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 transition shadow-sm font-medium"
        >
          Ir para Financeiro
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default QuantitativeLogComponent;
