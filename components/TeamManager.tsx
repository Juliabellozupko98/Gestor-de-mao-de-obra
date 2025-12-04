
import React, { useState } from 'react';
import { Collaborator, Role } from '../types';
import { UserPlus, Trash2, ArrowRight, UserCog, User, Calendar } from 'lucide-react';

interface Props {
  team: Collaborator[];
  setTeam: (team: Collaborator[]) => void;
  onNext: () => void;
}

const TeamManager: React.FC<Props> = ({ team, setTeam, onNext }) => {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('SERVENTE');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const addCollaborator = () => {
    if (!newName.trim()) return;
    const newMember: Collaborator = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      name: newName,
      role: newRole,
      startDate: startDate,
      endDate: endDate || undefined
    };
    setTeam([...team, newMember]);
    setNewName('');
    setEndDate('');
  };

  const removeCollaborator = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200 border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-teal-900">Etapa 2: Cadastro de Colaboradores</h2>
        <p className="text-teal-600 mb-6 text-sm">
          Cadastre os profissionais e serventes com suas respectivas datas de vigência.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-5 rounded-lg border border-slate-200">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-teal-800 mb-1">Nome do Colaborador</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900 placeholder-slate-400"
              placeholder="Nome completo"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-teal-800 mb-1">Função</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
            >
              <option value="PROFISSIONAL">Profissional</option>
              <option value="SERVENTE">Servente</option>
            </select>
          </div>
           <div className="md:col-span-2">
            <label className="block text-xs font-bold text-teal-800 mb-1">Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
            />
          </div>
           <div className="md:col-span-2">
            <label className="block text-xs font-bold text-teal-800 mb-1">Saída (Opcional)</label>
             <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={addCollaborator}
              disabled={!newName.trim()}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm font-medium"
            >
              <UserPlus size={18} />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-3 group hover:shadow-md hover:shadow-teal-100 transition relative">
             <button
              onClick={() => removeCollaborator(member.id)}
              className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition"
              title="Remover"
            >
              <Trash2 size={16} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${member.role === 'PROFISSIONAL' ? 'bg-teal-100 text-teal-700' : 'bg-cyan-100 text-cyan-700'}`}>
                {member.role === 'PROFISSIONAL' ? <UserCog size={20} /> : <User size={20} />}
              </div>
              <div>
                <p className="font-bold text-gray-900">{member.name}</p>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  member.role === 'PROFISSIONAL' 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'bg-cyan-50 text-cyan-700'
                }`}>
                  {member.role}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-2 mt-1">
                <div className="flex items-center gap-1">
                    <Calendar size={12}/> 
                    <span>Início: {new Date(member.startDate).toLocaleDateString('pt-BR')}</span>
                </div>
                {member.endDate && (
                     <div className="flex items-center gap-1">
                        <Calendar size={12}/> 
                        <span>Fim: {new Date(member.endDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                )}
            </div>
          </div>
        ))}
        {team.length === 0 && (
          <div className="col-span-full text-center py-12 text-teal-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            Nenhum colaborador cadastrado ainda.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={team.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition shadow-sm font-medium"
        >
          Ir para Orçamento
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TeamManager;
