alter table app_user
  add constraint semester_format_check
  check (enrolled_sem ~ '^(SUMMER|FALL|SPRING)[0-9]{2}$');