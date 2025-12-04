
export type Role = 'PROFISSIONAL' | 'SERVENTE';

export interface Project {
  name: string;
  createdAt: string;
  hourlyRateProf: number; // Etapa 2.1
  hourlyRateServ: number; // Etapa 2.1
}

export interface Collaborator {
  id: string;
  name: string;
  role: Role;
  startDate: string; // Nova data de início
  endDate?: string;  // Nova data de saída (opcional)
}

export interface BudgetItem {
  id: string;
  code: string; // Hierarquia (1.1, 1.2)
  description: string;
  unit: string; // Unidade (m², m³, vb)
  quantity: number; // Quantidade total prevista
  estimatedValue: number; // Valor monetário total previsto
  estimatedProfHours: number; // Horas totais previstas
  estimatedServHours: number; // Horas totais previstas
}

export interface DailyLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  collaboratorId: string;
  budgetItemId: string;
  hours: number;
  justification?: string;
}

// Etapa 5: Planejamento do Mês
export interface MonthlyPlan {
  id: string;
  month: string; // YYYY-MM
  budgetItemId: string;
  projectedPercentage: number; // % de avanço previsto
}

// Etapa 7: Medição do Quantitativo
export interface QuantitativeLog {
  id: string;
  month: string; // YYYY-MM
  budgetItemId: string;
  executedQuantity: number; // Quantidade física realizada no mês
}

// Etapa 9: Custo folha de pagamento RH
export interface FinancialRecord {
  id: string;
  month: string; // YYYY-MM
  hrHours: number; // Horas levantadas pelo RH
  payrollCost: number; // Custo da folha
  indirectCost: number; // Custos indiretos
}

export const DAILY_WORK_HOURS = 8;
