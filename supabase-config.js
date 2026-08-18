const SUPABASE_URL = 'https://trscqdizztkfupntqplo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyc2NxZGl6enRrZnVwbnRxcGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTk4NDEsImV4cCI6MjEwMjM3NTg0MX0.CykzlDqkkH2uwJ2vkZFwCi6bG8H3E3qplVMwKQUA6JA';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON) : null;
