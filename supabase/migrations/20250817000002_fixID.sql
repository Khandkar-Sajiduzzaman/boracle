
alter table app_user rename to userInfo;

alter table userInfo
  alter column student_id type bigint using student_id::bigint;

alter table userInfo
  add constraint student_id_exact_length
  check (student_id between 10000000 and 99999999);

alter table userInfo
  add constraint student_id_unique unique (student_id);