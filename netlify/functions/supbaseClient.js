import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uwtiegxhlznideehcrio.supabase.co"; // replace with your Supabase URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dGllZ3hobHpuaWRlZWhjcmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzUwODEsImV4cCI6MjA2NDYxMTA4MX0.uP0Xtu0e-9r-VqzMQGoTdJ8t40sRuRtIxefitGmMZ7Q"; // replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
