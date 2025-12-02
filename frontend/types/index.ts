export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  amount: number;
  members: User[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string;
  group?: string;
  yourShare: number;
  owedAmount?: number;
}

export interface Transaction {
  id: string;
  title: string;
  paidBy: string;
  paidByAmount: number;
  amount: number;
  date: string;
  category?: string;
  participants: {
    name: string;
    share: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
