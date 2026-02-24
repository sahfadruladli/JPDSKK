export type LetterType = 'Masuk' | 'Keluar';

export interface LetterRecord {
  id: string;
  type: LetterType;
  fromTo: string;
  reference: string;
  date: string;
  subject: string;
  relatedFile: string;
  assignedOfficer: string;
  createdAt: string;
}

export interface SummaryStats {
  totalIncoming: number;
  totalOutgoing: number;
}
