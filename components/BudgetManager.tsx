
import React, { useState, useRef } from 'react';
import { BudgetItem } from '../types';
import { Plus, Trash2, ArrowRight, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  budget: BudgetItem[];
  setBudget: (budget: BudgetItem[]) => void;
  onNext: () => void;
}

const BudgetManager: React.FC<Props> = ({ budget, setBudget, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<BudgetItem>>({
    code: '',
    description: '',
    unit: '',
    quantity: 0,
    estimatedValue: 0,
    estimatedProfHours: 0,
    estimatedServHours: 0
  });

  const handleChange = (field: keyof BudgetItem, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (!formData.code || !formData.description) return;
    
    const newItem: BudgetItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      code: formData.code,
      description: formData.description,
      unit: formData.unit || 'un',
      quantity: Number(formData.quantity) || 0,
      estimatedValue: Number(formData.estimatedValue) || 0,
      estimatedProfHours: Number(formData.estimatedProfHours) || 0,
      estimatedServHours: Number(formData.estimatedServHours) || 0,
    };

    const newBudget = [...budget, newItem].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    setBudget(newBudget);
    
    setFormData({
      code: '', description: '', unit: '', quantity: 0, estimatedValue: 0, estimatedProfHours: 0, estimatedServHours: 0
    });
  };

  const removeItem = (id: string) => {
    setBudget(budget.filter(i => i.id !== id));
  };

  const clearBudget = () => {
    if (budget.length === 0) return;
    if (window.confirm('Tem certeza que deseja apagar todos os itens do orçamento?')) {
      setBudget([]);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      ['Codigo', 'Descricao', 'Unidade', 'Quantidade', 'ValorPrevisto', 'HorasProfissional', 'HorasServente'],
      ['1.1', 'Alvenaria', 'm2', 100, 5000.00, 50, 80]
    ];
    
    // Safety check for xlsx import structure
    const utils = XLSX.utils || (XLSX as any).default?.utils;
    const write = XLSX.writeFile || (XLSX as any).default?.writeFile;

    if (!utils || !write) {
        alert('Erro ao carregar biblioteca Excel. Tente recarregar a página.');
        return;
    }
    
    const ws = utils.aoa_to_sheet(headers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Modelo");
    write(wb, "modelo_orcamento_gestor_mao_obra.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Safety check for xlsx import structure
    const read = XLSX.read || (XLSX as any).default?.read;
    const utils = XLSX.utils || (XLSX as any).default?.utils;

     if (!read || !utils) {
        alert('Erro ao carregar biblioteca Excel. Tente recarregar a página.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = utils.sheet_to_json(ws);

      const newItems: BudgetItem[] = data.map((row: any) => ({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        code: String(row['Codigo'] || row['Código'] || row['Item'] || ''),
        description: row['Descricao'] || row['Descrição'] || row['Descriçao'] || '',
        unit: row['Unidade'] || 'un',
        quantity: Number(row['Quantidade'] || row['Qtd'] || 0),
        estimatedValue: Number(row['ValorPrevisto'] || row['Valor'] || 0),
        estimatedProfHours: Number(row['HorasProfissional'] || row['HorasProf'] || 0),
        estimatedServHours: Number(row['HorasServente'] || row['HorasServ'] || 0),
      })).filter((item: any) => item.code && item.description);

      if (newItems.length > 0) {
        const updatedBudget = [...budget, ...newItems].sort((a: any, b: any) => a.code.localeCompare(b.code, undefined, { numeric: true }));
        setBudget(updatedBudget);
        alert(`${newItems.length} itens importados com sucesso!`);
      } else {
        alert('Nenhum item válido encontrado.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-900">Etapa 3: Planilha Orçamentária</h2>
            <p className="text-teal-600 text-sm">Defina a estrutura, quantitativos e horas estimadas.</p>
          </div>
          <div className="flex gap-2">
            {budget.length > 0 && (
              <button onClick={clearBudget} className="px-3 py-2 text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-100 flex items-center gap-2 text-sm font-medium transition">
                <Trash2 size={16} /> Limpar Planilha
              </button>
            )}
            <button onClick={downloadTemplate} className="px-3 py-2 text-teal-700 bg-teal-50 border border-teal-100 rounded hover:bg-teal-100 flex gap-2 items-center text-sm font-medium transition">
              <Download size={16} /> Baixar Modelo
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 text-white bg-green-600 rounded hover:bg-green-700 flex gap-2 items-center text-sm font-medium transition shadow-sm">
              <Upload size={16} /> Importar Excel
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.csv" className="hidden" />
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-12 gap-2 items-end bg-slate-100 p-4 rounded-lg border border-slate-300 mb-6">
          <div className="col-span-12 md:col-span-1">
            <label className="text-xs font-bold text-teal-800">Item</label>
            <input type="text" value={formData.code} onChange={e => handleChange('code', e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-teal-500 focus:outline-none" placeholder="1.1" />
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className="text-xs font-bold text-teal-800">Descrição</label>
            <input type="text" value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
          <div className="col-span-6 md:col-span-1">
            <label className="text-xs font-bold text-teal-800">Un.</label>
            <input type="text" value={formData.unit} onChange={e => handleChange('unit', e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
          <div className="col-span-6 md:col-span-1">
            <label className="text-xs font-bold text-teal-800">Qtd.</label>
            <input type="number" value={formData.quantity} onChange={e => handleChange('quantity', e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
           <div className="col-span-6 md:col-span-2">
            <label className="text-xs font-bold text-teal-800">Valor (R$)</label>
            <input type="number" value={formData.estimatedValue} onChange={e => handleChange('estimatedValue', e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
          <div className="col-span-6 md:col-span-1">
            <label className="text-xs font-bold text-teal-800">H. Prof</label>
            <input type="number" value={formData.estimatedProfHours} onChange={e => handleChange('estimatedProfHours', e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
          <div className="col-span-6 md:col-span-1">
            <label className="text-xs font-bold text-teal-800">H. Serv</label>
            <input type="number" value={formData.estimatedServHours} onChange={e => handleChange('estimatedServHours', e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
          <div className="col-span-12 md:col-span-1">
            <button onClick={addItem} className="w-full py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 flex justify-center"><Plus size={18} /></button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md shadow-slate-200 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-900">
            <thead className="bg-teal-50 text-teal-800 font-semibold border-b border-teal-200">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3 text-center">Un.</th>
                <th className="px-4 py-3 text-right">Qtd.</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-right">H. Prof</th>
                <th className="px-4 py-3 text-right">H. Serv</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-gray-900">
              {budget.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{item.code}</td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-center text-slate-500">{item.unit}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.estimatedValue)}</td>
                  <td className="px-4 py-2 text-right text-teal-700 font-medium">{item.estimatedProfHours}</td>
                  <td className="px-4 py-2 text-right text-cyan-700 font-medium">{item.estimatedServHours}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {budget.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Nenhum item cadastrado. Importe uma planilha ou adicione manualmente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} disabled={budget.length === 0} className="flex items-center gap-2 px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition shadow-sm font-medium">
          Salvar e Avançar <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default BudgetManager;
