insert into userinfo (name, email, role)
values
  ('Alice',   'alice@g.bracu.ac.bd',  'student'),
  ('Bob',     'bob@g.bracu.ac.bd'   , 'student'),
  ('Cara',    'cara@g.bracu.ac.bd'   , 'student'), 
  ('Deleted User', 'deleted@g.bracu.ac.bd', 'student'),
on conflict (email) do nothing;
