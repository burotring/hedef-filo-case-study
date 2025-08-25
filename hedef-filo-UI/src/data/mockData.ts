import { Case, Notification, CaseStatus } from '../types';
export const caseStatuses: CaseStatus[] = [
  { id: 1, name: 'Açık', date: '', description: 'Vaka açıldı' },
  { id: 2, name: 'İnceleniyor', date: '', description: 'Vaka inceleme altında' },
  { id: 3, name: 'Çözülüyor', date: '', description: 'Vaka çözüm aşamasında' },
  { id: 4, name: 'Tamamlandı', date: '', description: 'Vaka başarıyla tamamlandı' },
];
export const mockCases: Case[] = [
  {
    id: 1001,
    customerId: 'CUST001',
    caseType: 'Accident',
    supplierId: 'SUP123',
    createDate: '2024-01-15',
    lastStateId: 4,
    surveyRating: 5,
    statusHistory: [
      { id: 1, name: 'Açık', date: '2024-01-15', description: 'Kaza vakası açıldı' },
      { id: 2, name: 'İnceleniyor', date: '2024-01-16', description: 'Eksper incelemesi başladı' },
      { id: 3, name: 'Çözülüyor', date: '2024-01-18', description: 'Onarım süreci başladı' },
      { id: 4, name: 'Tamamlandı', date: '2024-01-22', description: 'Onarım tamamlandı' },
    ],
  },
  {
    id: 1002,
    customerId: 'CUST002',
    caseType: 'Damage',
    supplierId: 'SUP456',
    createDate: '2024-01-20',
    lastStateId: 2,
    statusHistory: [
      { id: 1, name: 'Açık', date: '2024-01-20', description: 'Hasar vakası açıldı' },
      { id: 2, name: 'İnceleniyor', date: '2024-01-21', description: 'Hasar değerlendirmesi yapılıyor' },
    ],
  },
  {
    id: 1003,
    customerId: 'CUST001',
    caseType: 'Maintenance',
    createDate: '2024-01-25',
    lastStateId: 1,
    statusHistory: [
      { id: 1, name: 'Açık', date: '2024-01-25', description: 'Bakım vakası açıldı' },
    ],
  },
];
export const mockNotifications: Notification[] = [
  {
    id: 1,
    caseId: 1001,
    message: 'Vaka #1001 durumu "Tamamlandı" olarak güncellendi',
    date: '2024-01-22',
    isRead: false,
  },
  {
    id: 2,
    caseId: 1002,
    message: 'Vaka #1002 için eksper ataması yapıldı',
    date: '2024-01-21',
    isRead: true,
  },
  {
    id: 3,
    caseId: 1003,
    message: 'Yeni bakım vakası #1003 oluşturuldu',
    date: '2024-01-25',
    isRead: false,
  },
];
