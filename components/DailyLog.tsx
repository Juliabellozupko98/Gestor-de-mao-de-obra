
import React, { useState, useMemo } from 'react';
import { Collaborator, BudgetItem, DailyLogEntry, DAILY_WORK_HOURS } from '../types';
import { Calendar, User, CheckCircle2, AlertTriangle, AlertCircle, Plus, Trash2, Check } from 'lucide-react';

interface Props {
  team: Collaborator[];
  budget: BudgetItem[];
  logs: DailyLogEntry[];
  setLogs: (logs: DailyLogEntry[]) => void;
  onNext: () => void;
}

const DailyLog: React.FC<Props> = ({ team, budget, logs, setLogs, onNext }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  
  // Modal State
  const [entryHours, setEntryHours] = useState<number>(0);
  const [selectedBudgetItemId, setSelectedBudgetItemId] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  // Derived Logic
  const dailyAllocations = useMemo(() => {
    return logs.filter(log => log.date === selectedDate);
  }, [logs, selectedDate]);

  const getCollaboratorHours = (collabId: string) => {
    return dailyAllocations
      .filter(l => l.collaboratorId === collabId)
      .reduce((sum, item) => sum + item.hours, 0);
  };

  const selectedCollaborator = team.find(c => c.id === selectedCollaboratorId);

  const getTotalConsumedHoursForItem = (itemId: string, role: 'PROFISSIONAL' | 'SERVENTE') => {
    return logs
      .filter(l => {
        const worker = team.find(t => t.id === l.collaboratorId);
        return l.budgetItemId === itemId && worker?.role === role;
      })
      .reduce((sum, l) => sum + l.hours, 0);
  };

  const itemStats = useMemo(() => {
    if (!selectedBudgetItemId || !selectedCollaborator) return null;
    const item = budget.find(b => b.id === selectedBudgetItemId);
    if (!item) return null;

    const role = selectedCollaborator.role;
    const limit = role === 'PROFISSIONAL' ? item.estimatedProfHours : item.estimatedServHours;
    const consumed = getTotalConsumedHoursForItem(item.id, role);
    const remaining = limit - consumed;

    return { limit, consumed, remaining, role };
  }, [selectedBudgetItemId, selectedCollaborator, budget, logs, team]);

  const isOverBudget = useMemo(() => {
    if (!itemStats) return false;
    return (itemStats.consumed + entryHours) > itemStats.limit;
  }, [itemStats, entryHours]);

  const handleAddEntry = () => {
    if (!selectedCollaboratorId || !selectedBudgetItemId || entryHours <= 0) return;
    
    // Check daily limit (8h)
    const currentDailyHours = getCollaboratorHours(selectedCollaboratorId);
    if (currentDailyHours + entryHours > DAILY_WORK_HOURS) {
      alert(`Erro: O colaborador não pode exceder ${DAILY_WORK_HOURS} horas diárias. Horas atuais: ${currentDailyHours}h.`);
      return;
    }

    // Check justification requirement
    if (isOverBudget && !justification.trim()) {
      alert("Justificativa é obrigatória pois o consumo excede o previsto para este item.");
      return;
    }

    const newEntry: DailyLogEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      date: selectedDate,
      collaboratorId: selectedCollaboratorId,
      budgetItemId: selectedBudgetItemId,
      hours: entryHours,
      justification: isOverBudget ? justification : undefined
    };

    setLogs([...logs, newEntry]);
    
    // Reset form
    setEntryHours(0);
    setJustification('');
    setShowForm(false);
  };

  const handleDeleteEntry = (logId: string) => {
    setLogs(logs.filter(l => l.id !== logId));
  };

  const setFullDay = () => {
      setEntryHours(8);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Col: Date & Team Selection */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md shadow-slate-200 border border-slate-200 flex flex-col h-full">
        <div className="mb-6">
          <label className="block text-sm font-bold text-teal-800 mb-2">Data da Medição</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-teal-500" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        <h3 className="font-semibold text-teal-900 mb-4">Equipe no Dia</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {team.map(member => {
            const hoursLogged = getCollaboratorHours(member.id);
            const isComplete = hoursLogged === DAILY_WORK_HOURS;
            const isSelected = selectedCollaboratorId === member.id;

            return (
              <button
                key={member.id}
                onClick={() => { setSelectedCollaboratorId(member.id); setShowForm(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isSelected 
                    ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500 shadow-sm' 
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${member.role === 'PROFISSIONAL' ? 'bg-teal-100 text-teal-700' : 'bg-cyan-100 text-cyan-700'}`}>
                    <User size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-[10px] text-teal-500 font-bold">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
                    {hoursLogged}/{DAILY_WORK_HOURS}h
                  </span>
                  {isComplete && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Col: Allocation Form & List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md shadow-slate-200 border border-slate-200 flex flex-col h-full">
        {!selectedCollaboratorId ? (
          <div className="flex flex-col items-center justify-center h-full text-teal-300">
            <User size={48} className="mb-4 opacity-30" />
            <p className="text-teal-500">Selecione um colaborador ao lado para lançar horas.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-teal-900">{selectedCollaborator?.name}</h2>
                <p className="text-sm text-teal-500">
                  Lançamentos para {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
              </div>
              <div className="text-right">
                 <span className="text-sm text-teal-500 block">Horas Disponíveis</span>
                 <span className="text-xl font-bold text-teal-600">
                   {DAILY_WORK_HOURS - getCollaboratorHours(selectedCollaboratorId)}h
                 </span>
              </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto mb-6">
              {dailyAllocations
                .filter(l => l.collaboratorId === selectedCollaboratorId)
                .map(log => {
                  const item = budget.find(b => b.id === log.budgetItemId);
                  return (
                    <div key={log.id} className="flex items-start justify-between p-3 mb-2 bg-slate-50 rounded border border-slate-200">
                      <div>
                        <p className="font-medium text-sm text-gray-900">Item {item?.code} - {item?.description}</p>
                        {log.justification && (
                          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> Justificativa: {log.justification}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-teal-700">{log.hours}h</span>
                        <button onClick={() => handleDeleteEntry(log.id)} className="text-slate-400 hover:text-red-500 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              {dailyAllocations.filter(l => l.collaboratorId === selectedCollaboratorId).length === 0 && (
                <p className="text-center text-teal-400 text-sm py-4">Nenhum lançamento para hoje.</p>
              )}
            </div>

            {/* Add Form */}
            {getCollaboratorHours(selectedCollaboratorId) < DAILY_WORK_HOURS ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                 {!showForm ? (
                   <button 
                    onClick={() => setShowForm(true)}
                    className="w-full py-2 bg-white border border-dashed border-teal-300 text-teal-600 rounded hover:bg-white hover:text-teal-700 hover:border-teal-500 transition flex items-center justify-center gap-2"
                   >
                     <Plus size={18} /> Adicionar Lançamento
                   </button>
                 ) : (
                   <div className="space-y-3">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-teal-800 mb-1">Item do Orçamento</label>
                         <select 
                            value={selectedBudgetItemId}
                            onChange={(e) => setSelectedBudgetItemId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                         >
                           <option value="">Selecione...</option>
                           {budget.map(b => (
                             <option key={b.id} value={b.id}>{b.code} - {b.description}</option>
                           ))}
                         </select>
                         {itemStats && (
                           <div className="text-xs mt-1 px-1 flex justify-between">
                             <span className="text-teal-600">
                               Total Previsto: {itemStats.limit}h
                             </span>
                             <span className={`${itemStats.remaining < 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                               Saldo Atual: {itemStats.remaining}h
                             </span>
                           </div>
                         )}
                       </div>
                       <div className="md:col-span-1">
                         <label className="block text-xs font-bold text-teal-800 mb-1">Horas</label>
                         <div className="flex gap-1">
                             <input 
                                type="number" 
                                min="1" 
                                max={DAILY_WORK_HOURS - getCollaboratorHours(selectedCollaboratorId)}
                                value={entryHours}
                                onChange={(e) => setEntryHours(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                             />
                             <button 
                                onClick={setFullDay} 
                                title="Alocar 8 horas"
                                className="bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 rounded p-2 flex items-center justify-center transition"
                             >
                                <Check size={16} />
                             </button>
                         </div>
                       </div>
                     </div>

                     {isOverBudget && (
                       <div className="bg-amber-50 p-3 rounded border border-amber-200 animate-fadeIn">
                         <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-2">
                           <AlertTriangle size={14} />
                           <span>Atenção: Saldo de horas excedido!</span>
                         </div>
                         <textarea
                            placeholder="Justificativa obrigatória..."
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="w-full p-2 text-sm bg-white border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            rows={2}
                         />
                       </div>
                     )}

                     <div className="flex gap-2 pt-2">
                       <button 
                        onClick={handleAddEntry}
                        className="flex-1 bg-teal-600 text-white py-2 rounded text-sm font-medium hover:bg-teal-700 transition shadow-sm"
                       >
                         Confirmar
                       </button>
                       <button 
                        onClick={() => setShowForm(false)}
                        className="px-4 bg-white border border-slate-300 text-teal-600 py-2 rounded text-sm hover:bg-slate-50 transition"
                       >
                         Cancelar
                       </button>
                     </div>
                   </div>
                 )}
              </div>
            ) : (
              <div className="p-3 bg-green-50 text-green-700 text-center text-sm rounded border border-green-200 font-medium">
                Dia concluído! Todas as 8 horas foram alocadas.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailyLog;
