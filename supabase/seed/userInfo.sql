insert into userinfo (name, email, student_id, enrolled_sem, role)
values
  ('Alice',   'alice@g.bracu.ac.bd',     23301214,  'FALL25',   'student'),
  ('Bob',     'bob@g.bracu.ac.bd',       23301215,  'SPRING26', 'student'),
  ('Cara',    'cara@g.bracu.ac.bd',      23301219,  'SUMMER25', 'student'), -- fixed to 8 digits
on conflict (student_id) do nothing;
