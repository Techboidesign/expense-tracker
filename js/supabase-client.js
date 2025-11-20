const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tyeyqptdmcjhmncxzoew.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZXlxcHRkbWNqaG1uY3h6b2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzQ2MDgsImV4cCI6MjA3OTIxMDYwOH0.pMr1pdTE_RoZf-en7eBKyRqhoScACQ0aTyRsgaR0DrE';

let supabaseClient = null;
let currentUser = null;

export function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase library not loaded');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

export async function login(username, password) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase not initialized' };

  try {
    const { data: users, error } = await client
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      console.error('Login error:', error);
      return { error: error.message };
    }

    if (!users) {
      return { error: 'Invalid username or password' };
    }

    currentUser = users;
    localStorage.setItem('currentUser', JSON.stringify(users));

    return { data: users };
  } catch (err) {
    console.error('Login exception:', err);
    return { error: err.message };
  }
}

export function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
}

export function getCurrentUser() {
  if (currentUser) return currentUser;

  const stored = localStorage.getItem('currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }

  return null;
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export async function getExpenses() {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { data: [], error: 'Not authenticated' };

  try {
    const { data, error } = await client
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Get expenses error:', error);
      return { data: [], error: error.message };
    }

    const expenses = (data || []).map(expense => ({
      ...expense,
      due_date: expense.date,
      type: expense.category
    }));

    return { data: expenses };
  } catch (err) {
    console.error('Get expenses exception:', err);
    return { data: [], error: err.message };
  }
}

export async function addExpense(expense) {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { error: 'Not authenticated' };

  try {
    const expenseData = {
      user_id: user.id,
      name: expense.name,
      category: expense.type,
      amount: expense.amount,
      recurrence: expense.recurrence,
      date: expense.due_date,
      notes: expense.notes || ''
    };

    const { data, error } = await client
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();

    if (error) {
      console.error('Add expense error:', error);
      return { error: error.message };
    }

    const mappedData = {
      ...data,
      due_date: data.date,
      type: data.category
    };

    return { data: mappedData };
  } catch (err) {
    console.error('Add expense exception:', err);
    return { error: err.message };
  }
}

export async function updateExpense(id, updates) {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { error: 'Not authenticated' };

  try {
    const mappedUpdates = {};
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.type !== undefined) mappedUpdates.category = updates.type;
    if (updates.amount !== undefined) mappedUpdates.amount = updates.amount;
    if (updates.recurrence !== undefined) mappedUpdates.recurrence = updates.recurrence;
    if (updates.due_date !== undefined) mappedUpdates.date = updates.due_date;
    if (updates.notes !== undefined) mappedUpdates.notes = updates.notes;

    const { data, error } = await client
      .from('expenses')
      .update(mappedUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update expense error:', error);
      return { error: error.message };
    }

    const mappedData = {
      ...data,
      due_date: data.date,
      type: data.category
    };

    return { data: mappedData };
  } catch (err) {
    console.error('Update expense exception:', err);
    return { error: err.message };
  }
}

export async function deleteExpense(id) {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { error: 'Not authenticated' };

  try {
    const { error } = await client
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete expense error:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Delete expense exception:', err);
    return { error: err.message };
  }
}

export async function getBudget() {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { data: null, error: 'Not authenticated' };

  try {
    const { data, error } = await client
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Get budget error:', error);
      return { data: null, error: error.message };
    }

    return { data: data ? data.monthly_budget : 0 };
  } catch (err) {
    console.error('Get budget exception:', err);
    return { data: null, error: err.message };
  }
}

export async function getIncome() {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { data: null, error: 'Not authenticated' };

  try {
    const { data, error } = await client
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Get income error:', error);
      return { data: null, error: error.message };
    }

    return { data: data ? data.monthly_income : 0 };
  } catch (err) {
    console.error('Get income exception:', err);
    return { data: null, error: err.message };
  }
}

export async function updateUserBudget(budget, income) {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { error: 'Not authenticated' };

  try {
    if (budget !== undefined) {
      const { error: budgetError } = await client
        .from('budgets')
        .upsert({ user_id: user.id, monthly_budget: budget }, { onConflict: 'user_id' });

      if (budgetError) {
        console.error('Update budget error:', budgetError);
        return { error: budgetError.message };
      }
    }

    if (income !== undefined) {
      const { error: incomeError } = await client
        .from('income')
        .upsert({ user_id: user.id, monthly_income: income }, { onConflict: 'user_id' });

      if (incomeError) {
        console.error('Update income error:', incomeError);
        return { error: incomeError.message };
      }
    }

    return { data: { budget, income } };
  } catch (err) {
    console.error('Update budget/income exception:', err);
    return { error: err.message };
  }
}
