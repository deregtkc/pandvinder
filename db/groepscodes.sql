-- Pandvinder: groepscodes en groepsadmins. Idempotent; draaien na een verse backup.

-- 1. Kolommen
alter table groups add column if not exists join_code text unique;
alter table group_members add column if not exists role text not null default 'member';

-- 2. Unieke code (6 tekens, zonder verwarrende letters/cijfers)
create or replace function gen_join_code() returns text language plpgsql volatile
set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from groups where join_code = candidate);
  end loop;
  return candidate;
end $$;

-- 3. Bestaande groepen: code geven, maker wordt admin
update groups set join_code = gen_join_code() where join_code is null;
update group_members gm set role = 'admin'
  from groups g
  where g.id = gm.group_id and g.created_by = gm.user_id and gm.role <> 'admin';

-- 4. Helpers voor RLS en RPC's (security definer om recursie in policies te vermijden)
create or replace function is_group_member(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = gid and user_id = auth.uid());
$$;

create or replace function is_group_admin(gid uuid, uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = gid and user_id = uid and role = 'admin')
      or exists (select 1 from groups where id = gid and created_by = uid);
$$;

-- 5. RPC's
create or replace function create_group(p_name text, p_streak int, p_best_streak int, p_total int)
returns groups language plpgsql security definer set search_path = public as $$
declare g groups;
begin
  insert into groups (name, created_by, join_code) values (p_name, auth.uid(), gen_join_code())
    returning * into g;
  insert into group_members (group_id, user_id, streak, best_streak, total, role)
    values (g.id, auth.uid(), p_streak, p_best_streak, p_total, 'admin');
  return g;
end $$;

create or replace function join_group_by_code(p_code text, p_streak int, p_best_streak int, p_total int)
returns groups language plpgsql security definer set search_path = public as $$
declare g groups;
begin
  select * into g from groups where join_code = upper(trim(p_code));
  if not found then raise exception 'invalid_code'; end if;
  if not exists (select 1 from group_members where group_id = g.id and user_id = auth.uid()) then
    insert into group_members (group_id, user_id, streak, best_streak, total, role)
      values (g.id, auth.uid(), p_streak, p_best_streak, p_total, 'member');
  end if;
  return g;
end $$;

create or replace function set_group_member_role(p_group uuid, p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(p_group, auth.uid()) then raise exception 'not_admin'; end if;
  if p_role not in ('admin', 'member') then raise exception 'invalid_role'; end if;
  update group_members set role = p_role where group_id = p_group and user_id = p_user;
end $$;

create or replace function remove_group_member(p_group uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(p_group, auth.uid()) then raise exception 'not_admin'; end if;
  if exists (select 1 from groups where id = p_group and created_by = p_user) then raise exception 'creator'; end if;
  delete from group_members where group_id = p_group and user_id = p_user;
end $$;

-- 6. RLS: alle bestaande policies op deze twee tabellen weg, daarna alleen de nodige
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('groups', 'group_members') loop
    execute format('drop policy %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

alter table groups enable row level security;
alter table group_members enable row level security;

create policy groups_select_members on groups for select to authenticated
  using (is_group_member(id));
create policy groups_update_creator on groups for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy members_select_same_group on group_members for select to authenticated
  using (is_group_member(group_id));
create policy members_update_self on group_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy members_delete_self on group_members for delete to authenticated
  using (user_id = auth.uid());

-- 7. Privileges: directe inserts zijn dicht; alleen de eigen statistieken en de groepsnaam mogen worden bijgewerkt
revoke all on groups, group_members from anon;
revoke insert, update, delete on groups from authenticated;
revoke insert, update, delete on group_members from authenticated;
grant select on groups, group_members to authenticated;
grant update (name) on groups to authenticated;
grant delete on group_members to authenticated;
grant update (streak, best_streak, total) on group_members to authenticated;

-- 8. Functies: alleen de RPC's en de RLS-helper zijn aanroepbaar
revoke all on function gen_join_code(), is_group_admin(uuid, uuid), is_group_member(uuid),
  create_group(text, int, int, int), join_group_by_code(text, int, int, int),
  set_group_member_role(uuid, uuid, text), remove_group_member(uuid, uuid)
  from public, anon, authenticated;
grant execute on function is_group_member(uuid) to authenticated;
grant execute on function create_group(text, int, int, int), join_group_by_code(text, int, int, int),
  set_group_member_role(uuid, uuid, text), remove_group_member(uuid, uuid) to authenticated;
