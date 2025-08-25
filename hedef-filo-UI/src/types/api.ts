export interface BackendCase {
  _id: string;
  caseId: number;
  customer: {
    _id: string;
    customerId: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  caseType: {
    _id: string;
    code: string;
    name: string;
  };
  supplier?: {
    _id: string;
    supplierId: string;
    name?: string;
    phone?: string;
  };
  createDate: string;
  lastState: {
    _id: string;
    code: number;
    name: string;
    isTerminal: boolean;
  };
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCaseEvent {
  _id: string;
  case: string;
  type: 'STATUS_CHANGED' | 'SERVICE_CHANGED' | 'NOTE';
  fromStatus?: {
    _id: string;
    code: number;
    name: string;
    isTerminal: boolean;
  };
  toStatus?: {
    _id: string;
    code: number;
    name: string;
    isTerminal: boolean;
  };
  note?: string;
  createdAt: string;
}

export interface BackendNotification {
  _id: string;
  case: {
    _id: string;
    caseId: number;
  };
  customer: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface BackendSurvey {
  _id: string;
  case: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface BackendCaseType {
  _id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendStatusCode {
  _id: string; 
  code: number;
  name: string;
  isTerminal: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseDetailResponse {
  case: BackendCase;
  timeline: BackendCaseEvent[];
  survey?: BackendSurvey;
}

export interface CreateCaseRequest {
  caseId: number;
  customerId: string;
  caseTypeCode: string;
  supplierId?: string;
}

export interface UpdateCaseStatusRequest {
  statusCode: number;
}

export interface UpdateSupplierRequest {
  supplierId: string;
}

export interface CreateSurveyRequest {
  rating: number;
  comment?: string;
}

export interface SurveyStats {
  totalSurveys: number;
  averageRating: number;
  ratingDistribution: Array<{
    _id: number;
    count: number;
  }>;
}
