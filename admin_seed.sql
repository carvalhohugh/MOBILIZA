-- Execute este script no SQL Editor do Supabase para criar o usuário admin

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.com',
  crypt('super@123', gen_salt('bf')),
  current_timestamp,
  NULL,
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{}',
  current_timestamp,
  current_timestamp,
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    id,
    format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
    'email',
    current_timestamp,
    current_timestamp,
    current_timestamp
FROM auth.users
WHERE email = 'admin@admin.com';
