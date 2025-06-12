# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# IF ANYONE ELSE WORKS ON THIS AND READS THIS 

Authentication doesn't work properly and I have some error where it loads indefinitely the first time you open the website, if you "inspect" the website and go to "application" then "clear site data" it will work. No idea why or how but yeah.

The database is hosted on Supabase currently and the tables are called "Profiles" and "Requests"
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  company_name text,
  cif text,
  created_at timestamp with time zone DEFAULT now(),
  email character varying NOT NULL,
  role text DEFAULT 'user'::text,
  status text DEFAULT 'pending'::text,
  address text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  brand text NOT NULL,
  delivery_note_or_invoice_number text NOT NULL,
  reason_for_return text NOT NULL,
  part_number text NOT NULL,
  quantity integer NOT NULL,
  observations text,
  status text DEFAULT 'pending'::text,
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT requests_pkey PRIMARY KEY (id),
  CONSTRAINT requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

I'm not sure if it works to have admins approve new users or not, I think it might?

Anyways, Melker is love. Melker is life.
Ciao!