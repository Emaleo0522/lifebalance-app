export type FamilyGroup = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
};

export type FamilyMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export type SharedTask = {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  assigned_to: string[];
  due_date?: string;
  completed: boolean;
  created_at: string;
  created_by: string;
};

export type SharedExpense = {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  paid_by: string;
  split_between: string[];
  created_at: string;
};