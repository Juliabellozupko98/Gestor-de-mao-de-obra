
import React, { useState, useEffect } from 'react';
import { Project, Collaborator, BudgetItem, DailyLogEntry, MonthlyPlan, QuantitativeLog, FinancialRecord } from './types';
import ProjectSetup from './components/ProjectSetup';
import TeamManager from './components/TeamManager';
import BudgetManager from './components/BudgetManager';
import DailyLog from './components/DailyLog';
import Dashboard from './components/Dashboard';
import MonthlyPlanning from './components/MonthlyPlanning';
import QuantitativeLogComponent from './components/QuantitativeLog';
import FinancialInput from './components/FinancialInput';
import { LayoutDashboard, HardHat, FileSpreadsheet, ClipboardList, Settings, CalendarDays, BarChart3, Wallet } from 'lucide-react';

// Persistence Keys
const STORAGE_KEYS = {
  PROJECT: 'gestor_project',
  TEAM: 'gestor_team',
  BUDGET: 'gestor_budget',
  LOGS: 'gestor_logs',
  PLANS: 'gestor_plans',
  QUANTITATIVE: 'gestor_quantitative',
  FINANCIAL: 'gestor_financial'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('project');
  
  // Application State
  const [project, setProject] = useState<Project | null>(null);
  const [team, setTeam] = useState<Collaborator[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [quantitativeLogs, setQuantitativeLogs] = useState<QuantitativeLog[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedProject = localStorage.getItem(STORAGE_KEYS.PROJECT);
        const storedTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
        const storedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
        const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
        const storedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
        const storedQuant = localStorage.getItem(STORAGE_KEYS.QUANTITATIVE);
        const storedFin = localStorage.getItem(STORAGE_KEYS.FINANCIAL);

        if (storedProject) setProject(JSON.parse(storedProject));
        if (storedTeam) setTeam(JSON.parse(storedTeam));
        if (storedBudget) setBudget(JSON.parse(storedBudget));
        if (storedLogs) setLogs(JSON.parse(storedLogs));
        if (storedPlans) setPlans(JSON.parse(storedPlans));
        if (storedQuant) setQuantitativeLogs(JSON.parse(storedQuant));
        if (storedFin) setFinancialRecords(JSON.parse(storedFin));
      } catch (e) {
        console.error("Failed to load data from local storage", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Persist Data
  useEffect(() => {
    if (isLoaded) {
      try {
        if (project) localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
        localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
        localStorage.setItem(STORAGE_KEYS.QUANTITATIVE, JSON.stringify(quantitativeLogs));
        localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(financialRecords));
      } catch (e) {
        console.error("Failed to save data", e);
      }
    }
  }, [project, team, budget, logs, plans, quantitativeLogs, financialRecords, isLoaded]);

  if (!isLoaded) return <div className="flex h-screen items-center justify-center text-teal-600">Carregando sistema...</div>;

  const renderContent = () => {
    if (!project && activeTab !== 'project') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <HardHat size={64} className="text-teal-400 mb-4" />
          <h2 className="text-xl font-bold text-teal-800">Bem-vindo ao Gestor de Mão de Obra</h2>
          <p className="text-teal-600 mb-6">Para começar, configure os dados iniciais da obra.</p>
          <button 
            onClick={() => setActiveTab('project')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition shadow-md shadow-teal-200"
          >
            Configurar Obra
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'project':
        return <ProjectSetup project={project} setProject={setProject} onNext={() => setActiveTab('team')} />;
      case 'team':
        return <TeamManager team={team} setTeam={setTeam} onNext={() => setActiveTab('budget')} />;
      case 'budget':
        return <BudgetManager budget={budget} setBudget={setBudget} onNext={() => setActiveTab('planning')} />;
      case 'planning':
        return <MonthlyPlanning budget={budget} plans={plans} setPlans={setPlans} onNext={() => setActiveTab('daily')} />;
      case 'daily':
        return <DailyLog team={team} budget={budget} logs={logs} setLogs={setLogs} onNext={() => setActiveTab('quantitative')} />;
      case 'quantitative':
        return <QuantitativeLogComponent budget={budget} logs={quantitativeLogs} setLogs={setQuantitativeLogs} onNext={() => setActiveTab('financial')} />;
      case 'financial':
        return <FinancialInput records={financialRecords} setRecords={setFinancialRecords} onNext={() => setActiveTab('dashboard')} />;
      case 'dashboard':
        return <Dashboard project={project} team={team} budget={budget} logs={logs} plans={plans} quantitativeLogs={quantitativeLogs} financialRecords={financialRecords} />;
      default:
        return <ProjectSetup project={project} setProject={setProject} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-teal-900 text-teal-50 flex flex-col shrink-0">
        <div className="p-6 border-b border-teal-800">
          <div className="flex items-center gap-2 text-white font-bold text-lg leading-tight">
            <HardHat className="text-teal-300 shrink-0" size={24} />
            Gestor de Mão de Obra
          </div>
          {project && <p className="text-xs mt-2 text-teal-300 truncate">{project.name}</p>}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <SidebarItem 
              active={activeTab === 'project'} 
              onClick={() => setActiveTab('project')} 
              icon={<Settings size={20} />} 
              label="1. Obra" 
            />
            <SidebarItem 
              active={activeTab === 'team'} 
              onClick={() => setActiveTab('team')} 
              icon={<ClipboardList size={20} />} 
              label="2. Equipe" 
            />
            <SidebarItem 
              active={activeTab === 'budget'} 
              onClick={() => setActiveTab('budget')} 
              icon={<FileSpreadsheet size={20} />} 
              label="3. Orçamento" 
            />
            <SidebarItem 
              active={activeTab === 'planning'} 
              onClick={() => setActiveTab('planning')} 
              icon={<CalendarDays size={20} />} 
              label="4. Planejamento" 
            />
            <SidebarItem 
              active={activeTab === 'daily'} 
              onClick={() => setActiveTab('daily')} 
              icon={<ClipboardList size={20} />} 
              label="5. Medição Diária" 
            />
             <SidebarItem 
              active={activeTab === 'quantitative'} 
              onClick={() => setActiveTab('quantitative')} 
              icon={<BarChart3 size={20} />} 
              label="6. Med. Quantitativa" 
            />
             <SidebarItem 
              active={activeTab === 'financial'} 
              onClick={() => setActiveTab('financial')} 
              icon={<Wallet size={20} />} 
              label="7. Financeiro RH" 
            />
            <SidebarItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={20} />} 
              label="8. Dashboard" 
            />
          </ul>
        </nav>
        
        <div className="p-4 border-t border-teal-800 text-xs text-teal-400 text-center">
          v2.5.1 Teal Edition
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <h1 className="text-2xl font-bold text-teal-900">
            {activeTab === 'project' && 'Configuração da Obra'}
            {activeTab === 'team' && 'Equipe'}
            {activeTab === 'budget' && 'Planilha Orçamentária'}
            {activeTab === 'planning' && 'Planejamento Mensal'}
            {activeTab === 'daily' && 'Medição de Equipe (Diária)'}
            {activeTab === 'quantitative' && 'Medição de Quantitativo (Mensal)'}
            {activeTab === 'financial' && 'Custos Financeiros RH'}
            {activeTab === 'dashboard' && 'Painel de Controle'}
          </h1>
        </header>
        <div className="p-6 flex-1 bg-slate-50">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
        active 
          ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/20' 
          : 'hover:bg-teal-800 hover:text-white text-teal-100'
      }`}
    >
      {icon}
      {label}
    </button>
  </li>
);

export default App;
