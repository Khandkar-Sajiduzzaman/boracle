create table if not exists app_user (
  id           bigserial primary key,
  name         varchar(100)        not null,
  email        varchar(255)        not null unique,
  student_id   varchar(32)         unique,
  enrolled_sem smallint,
  role         varchar(32)         not null default 'student'
               check (role in ('student','moderator','admin'))
);