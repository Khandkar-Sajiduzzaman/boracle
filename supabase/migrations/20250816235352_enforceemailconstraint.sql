alter table app_user
  add constraint email_domain_check
  check (email like '%@g.bracu.ac.bd');

alter table app_user
  alter column enrolled_sem type varchar(10);
