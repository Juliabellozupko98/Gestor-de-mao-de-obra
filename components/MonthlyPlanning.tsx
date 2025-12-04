
import React, { useState } from 'react';
import { BudgetItem, MonthlyPlan } from '../types';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  budget: BudgetItem[];
  plans: MonthlyPlan[];
  setPlans: (plans: MonthlyPlan[]) => void;
  onNext: () => void;
}

const MonthlyPlanning: React.FC<Props> = ({ budget, plans, setPlans, onNext }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const handlePercentageChange = (itemId: string, value: string) => {
    const numValue = Math.min(100, Math.max(0, Number(value)));
    
    // Find if a plan already exists for this item AND this specific month
    const existingPlanIndex = plans.findIndex(p => p.budgetItemId === itemId && p.month === selectedMonth);
    const newPlans = [...plans];

    if (existingPlanIndex >= 0) {
      newPlans[existingPlanIndex] = { ...newPlans[existingPlanIndex], projectedPercentage: numValue };
    } else {
      newPlans.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        month: selectedMonth,
        budgetItemId: itemId,
        projectedPercentage: numValue
      });
    }
    setPlans(newPlans);
  };

  const getPlan = (itemId: string) => plans.find(p => p.budgetItemId === itemId && p.month === selectedMonth);

  // Calculate accumulated percentage across all months for validation/display
  const getAccumulatedPercentage = (itemId: string) => {
    return plans
      .filter(p => p.budgetItemId === itemId)
      .reduce((sum, p) => sum + p.projectedPercentage, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-900">Etapa 5: Planejamento Mensal</h2>
            <p className="text-teal-600 text-sm">Defina o % de avanço físico esperado para cada etapa em <strong>{selectedMonth}</strong>.</p>
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
                <th className="px-4 py-3 text-right">Qtd. Total</th>
                <th className="px-4 py-3 text-center text-teal-900 w-32 bg-teal-50">% Acum. Total</th>
                <th className="px-4 py-3 text-right text-teal-700 w-32 border-l border-teal-100">% Previsto (Mês)</th>
                <th className="px-4 py-3 text-right text-slate-600 bg-slate-50">Qtd. Prevista</th>
                <th className="px-4 py-3 text-right text-slate-600 bg-slate-50">Hrs Prof. Prev</th>
                <th className="px-4 py-3 text-right text-slate-600 bg-slate-50">Hrs Serv. Prev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-gray-900">
              {budget.map(item => {
                const plan = getPlan(item.id);
                const percent = plan?.projectedPercentage || 0;
                const accumulated = getAccumulatedPercentage(item.id);
                
                const qtyPredicted = (item.quantity * percent) / 100;
                const hoursProfPredicted = (item.estimatedProfHours * percent) / 100;
                const hoursServPredicted = (item.estimatedServHours * percent) / 100;

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.code}</td>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-center bg-teal-50">
                       <span className={`font-bold ${accumulated > 100 ? 'text-red-600' : 'text-slate-600'}`}>
                         {accumulated.toFixed(1)}%
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right border-l border-slate-100">
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={percent} 
                          onChange={(e) => handlePercentageChange(item.id, e.target.value)}
                          className="w-24 px-2 py-1 text-right bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none text-gray-900 font-bold"
                        />
                        <span className="absolute right-6 top-1.5 text-slate-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700 bg-slate-50">
                        {qtyPredicted.toFixed(2)} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right text-teal-600 bg-slate-50">
                        {hoursProfPredicted.toFixed(1)}h
                    </td>
                    <td className="px-4 py-3 text-right text-cyan-600 bg-slate-50">
                        {hoursServPredicted.toFixed(1)}h
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
          Ir para Medição Diária
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default MonthlyPlanning;
