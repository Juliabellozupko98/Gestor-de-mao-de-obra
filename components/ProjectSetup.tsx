
import React, { useState } from 'react';
import { Project } from '../types';
import { Save, ArrowRight, DollarSign } from 'lucide-react';

interface Props {
  project: Project | null;
  setProject: (p: Project) => void;
  onNext?: () => void;
}

const ProjectSetup: React.FC<Props> = ({ project, setProject, onNext }) => {
  const [name, setName] = useState(project?.name || '');
  const [rateProf, setRateProf] = useState(project?.hourlyRateProf || 50);
  const [rateServ, setRateServ] = useState(project?.hourlyRateServ || 35);

  const handleSave = () => {
    if (!name.trim()) return;
    setProject({
      name,
      createdAt: project?.createdAt || new Date().toISOString(),
      hourlyRateProf: Number(rateProf),
      hourlyRateServ: Number(rateServ)
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md shadow-slate-200 border border-slate-200">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-teal-900">Etapa 1 & 2.1: Iniciar Obra</h2>
        <p className="text-teal-600">
          Configure os dados iniciais e os custos hora base para os cálculos.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-teal-800 mb-1">Nome da Obra</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900 placeholder-slate-400"
            placeholder="Ex: Residencial Flores do Campo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-teal-800 mb-1">Custo Hora Profissional (R$)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 text-teal-500" size={16} />
                    <input
                        type="number"
                        min="0"
                        value={rateProf}
                        onChange={(e) => setRateProf(Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-teal-800 mb-1">Custo Hora Servente (R$)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 text-teal-500" size={16} />
                    <input
                        type="number"
                        min="0"
                        value={rateServ}
                        onChange={(e) => setRateServ(Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
                    />
                </div>
            </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm font-medium"
          >
            <Save size={18} />
            Salvar Dados
          </button>

          {project && onNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-2 text-teal-700 hover:bg-teal-50 rounded-lg transition font-medium"
            >
              Próxima Etapa
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
      
      {project && (
        <div className="mt-8 p-4 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          <strong>Status:</strong> Obra "{project.name}" configurada.
        </div>
      )}
    </div>
  );
};

export default ProjectSetup;
