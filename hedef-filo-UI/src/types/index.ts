export interface Case {
  id: number;
  customerId: string;
  caseType: CaseType;
  supplierId?: string;
  createDate: string;
  lastStateId: number;
  surveyRating?: number;
  statusHistory: CaseStatus[];
}
export type CaseType = 'Accident' | 'Damage' | 'Maintenance' | 'Other';
export interface CaseStatus {
  id: number;
  name: string;
  date: string;
  description?: string;
}
export interface Notification {
  id: number;
  caseId: number;
  message: string;
  date: string;
  isRead: boolean;
}
export interface AppContextType {
  cases: Case[];
  notifications: Notification[];
  addCase: (caseData: Omit<Case, 'id' | 'createDate' | 'lastStateId' | 'statusHistory'>) => void;
  updateCase: (id: number, updates: Partial<Case>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date'>) => void;
  markNotificationAsRead: (id: number) => void;
}
