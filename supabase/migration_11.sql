-- =========================================================
-- Nexrnn LMS — Migration 11
-- Run AFTER migration_10.sql.
-- Makes issued certificate number and issue date immutable.
-- =========================================================

create or replace function protect_certificate_identity()
returns trigger as $$
begin
  if TG_OP = 'UPDATE' then
    if NEW.certificate_id is distinct from OLD.certificate_id
       or NEW.registration_id is distinct from OLD.registration_id
       or NEW.issued_at is distinct from OLD.issued_at then
      raise exception 'Certificate ID and issue date cannot be changed after issue.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_certificate_identity on certificates;
create trigger protect_certificate_identity
  before update on certificates
  for each row execute procedure protect_certificate_identity();
