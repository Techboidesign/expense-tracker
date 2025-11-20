const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
      .eq('password_hash', password)
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
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Get expenses error:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
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
      ...expense,
      user_id: user.id
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

    return { data };
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
    const { data, error } = await client
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update expense error:', error);
      return { error: error.message };
    }

    return { data };
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

export async function updateUserBudget(budget, income) {
  const client = getSupabaseClient();
  const user = getCurrentUser();

  if (!client || !user) return { error: 'Not authenticated' };

  try {
    const updates = {};
    if (budget !== undefined) updates.monthly_budget = budget;
    if (income !== undefined) updates.monthly_income = income;

    const { data, error } = await client
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update user error:', error);
      return { error: error.message };
    }

    currentUser = { ...currentUser, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return { data };
  } catch (err) {
    console.error('Update user exception:', err);
    return { error: err.message };
  }
}
