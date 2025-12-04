
import React, { useState } from 'react';
import { FinancialRecord } from '../types';
import { Calendar, Save, ArrowRight, DollarSign, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  records: FinancialRecord[];
  setRecords: (rec: FinancialRecord[]) => void;
  onNext: () => void;
}

const FinancialInput: React.FC<Props> = ({ records, setRecords, onNext }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const getCurrentRecord = () => {
    return records.find(r => r.month === selectedMonth) || {
      id: '', month: selectedMonth, hrHours: 0, payrollCost: 0, indirectCost: 0
    };
  };

  const [formData, setFormData] = useState<FinancialRecord>(getCurrentRecord());

  React.useEffect(() => {
    const rec = records.find(r => r.month === selectedMonth);
    if (rec) {
      setFormData(rec);
    } else {
      setFormData({ id: '', month: selectedMonth, hrHours: 0, payrollCost: 0, indirectCost: 0 });
    }
  }, [selectedMonth, records]);

  const handleChange = (field: keyof FinancialRecord, value: string) => {
    setFormData(prev => ({ ...prev, [field]: Number(value) }));
  };

  const handleSave = () => {
    // Remove existing record for this month if it exists
    const newRecords = records.filter(r => r.month !== selectedMonth);
    
    // Add new/updated record
    newRecords.push({
      ...formData,
      id: formData.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
      month: selectedMonth
    });
    
    setRecords(newRecords);
    alert(`Dados financeiros de ${selectedMonth} salvos com sucesso!`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-900">Etapa 9: Custo RH e Indiretos</h2>
            <p className="text-teal-600 text-sm">Insira os custos reais da folha de pagamento e indiretos de <strong>{selectedMonth}</strong>.</p>
          </div>
          
          <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 text-teal-600 hover:bg-white hover:shadow rounded transition" title="Mês Anterior">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 px-4 border-l border-r border-slate-200 mx-1">
              <Calendar size={18} className="text-purple-600" />
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

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-teal-500"/> Aba 1: Horas Levantadas pelo RH
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
               <label className="block text-xs font-bold text-teal-800 mb-1">Total de Horas Pagas (Folha)</label>
               <input 
                 type="number" 
                 value={formData.hrHours}
                 onChange={(e) => handleChange('hrHours', e.target.value)}
                 className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
               />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-green-500"/> Aba 2: Custo da Folha
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
               <label className="block text-xs font-bold text-teal-800 mb-1">Valor Total Folha Pagamento (R$)</label>
               <input 
                 type="number" 
                 value={formData.payrollCost}
                 onChange={(e) => handleChange('payrollCost', e.target.value)}
                 className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
               />
            </div>
          </div>

          <div>
             <h3 className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-orange-500"/> Aba 3: Custos Indiretos
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
               <label className="block text-xs font-bold text-teal-800 mb-1">Valor Custos Indiretos (R$)</label>
               <input 
                 type="number" 
                 value={formData.indirectCost}
                 onChange={(e) => handleChange('indirectCost', e.target.value)}
                 className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
               />
            </div>
          </div>
          
          <button onClick={handleSave} className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2 shadow-sm font-medium">
            <Save size={18} /> Salvar Dados do Mês
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 transition shadow-sm font-medium"
        >
          Ir para Dashboards
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default FinancialInput;
