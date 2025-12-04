
import React, { useState, useMemo } from 'react';
import { Project, Collaborator, BudgetItem, DailyLogEntry, MonthlyPlan, QuantitativeLog, FinancialRecord } from '../types';
import { DollarSign, Activity, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface Props {
  project: Project | null;
  team: Collaborator[];
  budget: BudgetItem[];
  logs: DailyLogEntry[];
  plans: MonthlyPlan[];
  quantitativeLogs: QuantitativeLog[];
  financialRecords: FinancialRecord[];
}

const Dashboard: React.FC<Props> = ({ project, budget, logs, team, plans, quantitativeLogs, financialRecords }) => {
  const [activeTab, setActiveTab] = useState<'productivity' | 'cost' | 'evolution'>('productivity');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Constants based on project config or defaults
  const RATE_PROF = project?.hourlyRateProf || 50;
  const RATE_SERV = project?.hourlyRateServ || 35;

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // --- Calculations ---

  const monthLogs = useMemo(() => logs.filter(l => l.date.startsWith(selectedMonth)), [logs, selectedMonth]);
  
  // Helpers
  const getMeasuredHours = (itemId: string, role?: 'PROFISSIONAL' | 'SERVENTE', specificMonth?: string) => {
    const targetLogs = specificMonth ? logs.filter(l => l.date.startsWith(specificMonth)) : monthLogs;
    return targetLogs
      .filter(l => l.budgetItemId === itemId && (!role || team.find(t => t.id === l.collaboratorId)?.role === role))
      .reduce((sum, l) => sum + l.hours, 0);
  };

  const getPlannedData = (itemId: string, specificMonth?: string) => {
    const month = specificMonth || selectedMonth;
    const plan = plans.find(p => p.budgetItemId === itemId && p.month === month);
    if (!plan) return { qty: 0, hoursProf: 0, hoursServ: 0 };
    
    const item = budget.find(b => b.id === itemId);
    if (!item) return { qty: 0, hoursProf: 0, hoursServ: 0 };

    return {
      qty: (item.quantity * plan.projectedPercentage) / 100,
      hoursProf: (item.estimatedProfHours * plan.projectedPercentage) / 100,
      hoursServ: (item.estimatedServHours * plan.projectedPercentage) / 100
    };
  };

  const getExecutedQty = (itemId: string, specificMonth?: string) => {
    return quantitativeLogs.find(q => q.budgetItemId === itemId && q.month === (specificMonth || selectedMonth))?.executedQuantity || 0;
  };

  const getFinancialRecord = (specificMonth?: string) => {
     return financialRecords.find(f => f.month === (specificMonth || selectedMonth)) || { hrHours: 0, payrollCost: 0, indirectCost: 0 };
  };

  // --- Evolution Data Generator ---
  const evolutionData = useMemo(() => {
    // Collect all unique months from logs and plans
    const allMonths = new Set<string>();
    logs.forEach(l => allMonths.add(l.date.slice(0, 7)));
    plans.forEach(p => allMonths.add(p.month));
    financialRecords.forEach(f => allMonths.add(f.month));
    
    const sortedMonths = Array.from(allMonths).sort();
    
    let accPredictedCost = 0;
    let accMeasuredCost = 0;
    let accRHCost = 0;
    
    let accPredictedHours = 0;
    let accMeasuredHours = 0;

    return sortedMonths.map(month => {
       // Monthly Totals
       let monthPredictedCost = 0;
       let monthMeasuredCost = 0;
       let monthPredictedHours = 0;
       let monthMeasuredHours = 0;
       
       budget.forEach(item => {
           const planned = getPlannedData(item.id, month);
           const measuredProf = getMeasuredHours(item.id, 'PROFISSIONAL', month);
           const measuredServ = getMeasuredHours(item.id, 'SERVENTE', month);
           
           monthPredictedCost += (planned.hoursProf * RATE_PROF) + (planned.hoursServ * RATE_SERV);
           monthMeasuredCost += (measuredProf * RATE_PROF) + (measuredServ * RATE_SERV);
           
           monthPredictedHours += (planned.hoursProf + planned.hoursServ);
           monthMeasuredHours += (measuredProf + measuredServ);
       });

       const rhCost = getFinancialRecord(month).payrollCost;

       // Accumulators
       accPredictedCost += monthPredictedCost;
       accMeasuredCost += monthMeasuredCost;
       accRHCost += rhCost;
       
       accPredictedHours += monthPredictedHours;
       accMeasuredHours += monthMeasuredHours;

       return {
           month,
           // Cost
           monthPredictedCost,
           monthMeasuredCost,
           monthRHCost: rhCost,
           accPredictedCost,
           accMeasuredCost,
           accRHCost,
           // Productivity (Hours)
           monthPredictedHours,
           monthMeasuredHours,
           accPredictedHours,
           accMeasuredHours
       };
    });
  }, [logs, plans, financialRecords, budget, RATE_PROF, RATE_SERV]);


  // --- Renderers ---

  const renderProductivity = () => {
    const totalPredictedHoursMonth = budget.reduce((acc, item) => {
        const planned = getPlannedData(item.id);
        return acc + planned.hoursProf + planned.hoursServ;
    }, 0);

    const productivityItems = budget.map(item => {
      const executedQty = getExecutedQty(item.id);
      const totalHoursUsed = getMeasuredHours(item.id);
      
      const realizedProd = executedQty > 0 ? totalHoursUsed / executedQty : 0;
      const plannedData = getPlannedData(item.id);
      const predictedProd = plannedData.qty > 0 ? (plannedData.hoursProf + plannedData.hoursServ) / plannedData.qty : 
                            (item.quantity > 0 ? (item.estimatedProfHours + item.estimatedServHours) / item.quantity : 0);

      return {
        ...item,
        executedQty,
        totalHoursUsed,
        realizedProd,
        predictedProd,
        deviation: realizedProd - predictedProd 
      };
    }).filter(i => i.executedQty > 0).sort((a, b) => b.executedQty - a.executedQty).slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-teal-600 font-bold text-sm mb-2">Horas Previstas no Mês</h3>
             <div className="flex items-end gap-2">
               <span className="text-3xl font-bold text-gray-900">
                 {totalPredictedHoursMonth.toFixed(1)}h
               </span>
               <span className="text-teal-500 text-sm mb-1">conforme planejamento</span>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-teal-600 font-bold text-sm mb-2">Horas Totais Apontadas</h3>
             <div className="flex items-end gap-2">
               <span className="text-3xl font-bold text-teal-700">
                 {monthLogs.reduce((acc, l) => acc + l.hours, 0).toFixed(1)}h
               </span>
               <span className="text-teal-500 text-sm mb-1">neste mês</span>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-teal-900">Top 5 Serviços Executados - Análise de Produtividade</h3>
            <p className="text-xs text-teal-600">Comparativo: Produtividade Prevista vs Realizada (h/unidade)</p>
          </div>
          <table className="w-full text-sm text-left text-gray-900">
            <thead className="bg-teal-50 text-teal-800 font-medium">
              <tr>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3 text-right">Qtd Exec.</th>
                <th className="px-6 py-3 text-right">Horas Gastas</th>
                <th className="px-6 py-3 text-right">Prod. Prevista (h/un)</th>
                <th className="px-6 py-3 text-right">Prod. Real (h/un)</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productivityItems.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 font-medium">{item.description}</td>
                  <td className="px-6 py-4 text-right">{item.executedQty} {item.unit}</td>
                  <td className="px-6 py-4 text-right">{item.totalHoursUsed}h</td>
                  <td className="px-6 py-4 text-right">{item.predictedProd.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-bold">{item.realizedProd.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    {item.realizedProd <= item.predictedProd ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 font-bold">Eficiente</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded border border-red-200 font-bold">Abaixo</span>
                    )}
                  </td>
                </tr>
              ))}
              {productivityItems.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-teal-400">Sem dados de execução neste mês.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCost = () => {
    const finRecord = getFinancialRecord();
    
    // Aggregates
    let totalPredictedCost = 0;
    let totalMeasuredCost = 0;

    const itemsData = budget.map(item => {
        const planned = getPlannedData(item.id);
        const measuredProf = getMeasuredHours(item.id, 'PROFISSIONAL');
        const measuredServ = getMeasuredHours(item.id, 'SERVENTE');

        const itemPredictedCost = (planned.hoursProf * RATE_PROF) + (planned.hoursServ * RATE_SERV);
        const itemMeasuredCost = (measuredProf * RATE_PROF) + (measuredServ * RATE_SERV);

        totalPredictedCost += itemPredictedCost;
        totalMeasuredCost += itemMeasuredCost;

        return { ...item, itemPredictedCost, itemMeasuredCost };
    });

    return (
      <div className="space-y-6">
        {/* Etapa 10 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-sm text-teal-600 font-bold mb-1">Custo Previsto (Planejamento)</div>
             <div className="text-2xl font-bold text-gray-800">
               {formatCurrency(totalPredictedCost)}
             </div>
             <p className="text-xs text-teal-500 mt-2">Baseado no % de avanço planejado</p>
           </div>
           
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-sm text-teal-600 font-bold mb-1">Custo Medido (Físico)</div>
             <div className="text-2xl font-bold text-teal-600">
               {formatCurrency(totalMeasuredCost)}
             </div>
             <p className="text-xs text-teal-500 mt-2">Horas apontadas x Tarifas Base</p>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-sm text-teal-600 font-bold mb-1">Custo Real (Folha RH)</div>
             <div className="text-2xl font-bold text-purple-600">
               {formatCurrency(finRecord.payrollCost)}
             </div>
             <p className="text-xs text-teal-500 mt-2">Valor pago efetivamente</p>
           </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
           <div className="px-6 py-4 border-b border-slate-200 bg-teal-50">
             <h3 className="font-bold text-teal-900">Detalhamento de Custo por Item</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left text-gray-900">
               <thead className="bg-white border-b border-slate-200 text-teal-800">
                  <tr>
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3 text-right">Previsto (R$)</th>
                    <th className="px-6 py-3 text-right">Medido (R$)</th>
                    <th className="px-6 py-3 text-right">Desvio</th>
                  </tr>
               </thead>
               <tbody>
                 {itemsData.filter(i => i.itemPredictedCost > 0 || i.itemMeasuredCost > 0).map(item => {
                   const diff = item.itemPredictedCost - item.itemMeasuredCost;
                   return (
                     <tr key={item.id} className="hover:bg-teal-50 border-b border-slate-100">
                       <td className="px-6 py-3">{item.code} - {item.description}</td>
                       <td className="px-6 py-3 text-right">{item.itemPredictedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                       <td className="px-6 py-3 text-right">{item.itemMeasuredCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                       <td className={`px-6 py-3 text-right font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  };

  const renderEvolution = () => {
    return (
      <div className="space-y-8">
        {/* Productivity Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-teal-900 mb-4">Evolução de Produtividade (Horas)</h3>
          <p className="text-sm text-teal-600 mb-6">Comparativo entre horas planejadas e horas apontadas mês a mês (Barras) e acumulado (Linhas).</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolutionData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                <YAxis yAxisId="left" stroke="#0d9488" fontSize={12} label={{ value: 'Horas (Mês)', angle: -90, position: 'insideLeft' }}/>
                <YAxis yAxisId="right" orientation="right" stroke="#0f172a" fontSize={12} label={{ value: 'Acumulado', angle: 90, position: 'insideRight' }}/>
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(1) + 'h', '']}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="monthPredictedHours" name="Previsto (Mês)" fill="#ccfbf1" />
                <Bar yAxisId="left" dataKey="monthMeasuredHours" name="Realizado (Mês)" fill="#5eead4" />
                <Line yAxisId="right" type="monotone" dataKey="accPredictedHours" name="Previsto (Acum)" stroke="#0f766e" strokeWidth={2} dot={{r: 4}} />
                <Line yAxisId="right" type="monotone" dataKey="accMeasuredHours" name="Realizado (Acum)" stroke="#115e59" strokeWidth={2} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-teal-900 mb-4">Evolução de Custos (R$)</h3>
          <p className="text-sm text-teal-600 mb-6">Curva S Financeira: Comparativo entre Custo Previsto, Medido e Real (RH).</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolutionData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                <YAxis yAxisId="left" stroke="#0d9488" fontSize={12} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#0f172a" fontSize={12} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                   formatter={(value: number) => [formatCurrency(value), '']}
                   labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="monthPredictedCost" name="Previsto (Mês)" fill="#e0e7ff" />
                <Bar yAxisId="left" dataKey="monthMeasuredCost" name="Medido (Mês)" fill="#818cf8" />
                <Line yAxisId="right" type="monotone" dataKey="accPredictedCost" name="Previsto (Acum)" stroke="#312e81" strokeWidth={2} dot={{r: 3}} />
                <Line yAxisId="right" type="monotone" dataKey="accMeasuredCost" name="Medido (Acum)" stroke="#4f46e5" strokeWidth={2} dot={{r: 3}} />
                <Line yAxisId="right" type="monotone" dataKey="accRHCost" name="Real RH (Acum)" stroke="#db2777" strokeWidth={2} dot={{r: 3}} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg overflow-x-auto">
          <button 
            onClick={() => setActiveTab('productivity')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition whitespace-nowrap ${activeTab === 'productivity' ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-teal-700'}`}
          >
            <Activity size={16} className="inline mr-2"/>
            Etapa 8: Produtividade
          </button>
          <button 
            onClick={() => setActiveTab('cost')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition whitespace-nowrap ${activeTab === 'cost' ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-teal-700'}`}
          >
            <DollarSign size={16} className="inline mr-2"/>
            Etapa 10: Custos
          </button>
          <button 
            onClick={() => setActiveTab('evolution')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition whitespace-nowrap ${activeTab === 'evolution' ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-teal-700'}`}
          >
            <TrendingUp size={16} className="inline mr-2"/>
            Evolução (Curva S)
          </button>
        </div>

        {activeTab !== 'evolution' && (
          <div className="flex items-center gap-2">
             <span className="text-sm font-bold text-teal-800">Mês de Análise:</span>
             <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                <button onClick={() => changeMonth(-1)} className="p-1 text-teal-600 hover:bg-white hover:shadow rounded transition" title="Mês Anterior">
                    <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2 px-2 border-l border-r border-slate-200 mx-1">
                    <Calendar size={16} className="text-teal-600" />
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-gray-900 font-bold text-sm w-32"
                    />
                </div>
                <button onClick={() => changeMonth(1)} className="p-1 text-teal-600 hover:bg-white hover:shadow rounded transition" title="Próximo Mês">
                    <ChevronRight size={16} />
                </button>
             </div>
          </div>
        )}
      </div>

      {activeTab === 'productivity' && renderProductivity()}
      {activeTab === 'cost' && renderCost()}
      {activeTab === 'evolution' && renderEvolution()}
    </div>
  );
};

export default Dashboard;
