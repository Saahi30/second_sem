import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mxqhkshqjhxzjouefvys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cWhrc2hxamh4empvdWVmdnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MzE1MzksImV4cCI6MjA2NDIwNzUzOX0.vCul_Ej_7RqmHLww7BFhFyhxI3KDrywF6OQKP49uHUQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
