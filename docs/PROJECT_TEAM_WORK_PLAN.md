# Project Team Work – Status & Time Tracking Plan

## Overview
- **Staff:** Project detail hides admin-only sections (Payment summary, Client deadline, Client details). Technology & tools visible to all. Each team member has their own work status (Not started / Start / Hold / End) with time tracking.
- **Client:** Sees project and team members’ status/timing in read-only; cannot update staff status. When client portal is added, same view is used.
- **Per-member timing:** Start → Hold (show time from start to pause) → Resume (timer continues) → End (show total; staff can add “Done points” note).

## Phase 1 (Done)
- Staff project detail: hide Payment summary section, Client deadline row, Client card and “View Client” link. Technology & tools remain visible to all.

## Phase 2 – Per–Team-Member Status & Time

### 2.1 Data model
- **project_team_members** (existing): add `work_status` ('not_started' | 'start' | 'hold' | 'end'), `work_started_at`, `work_ended_at`, `work_done_notes`.
- **project_team_member_time_events**: `id`, `project_id`, `user_id`, `event_type` ('start' | 'hold' | 'resume' | 'end'), `occurred_at`, `note` (for 'end' = done points). Enables accurate segments and day-wise analytics.

### 2.2 Behaviour
- **Start:** First time only; insert event `start`, set member `work_status=start`, `work_started_at=now`.
- **Hold:** Insert `hold`, set `work_status=hold`. Client/staff see “time from start to pause”.
- **Resume:** Insert `resume`, set `work_status=start`. Timer continues.
- **End:** Insert `end`, set `work_status=end`, `work_ended_at=now`. Prompt staff for “Done points” (saved in event `note` and/or `work_done_notes`). Show total calculated time.

### 2.3 Time computation
- **Elapsed (running):** If `work_status=start`, elapsed = now − last `resume` (or `start`) + sum of previous segments.
- **Total (ended):** Sum of segments from events (start→hold, resume→hold, …, resume→end).
- **Day-wise:** Group events by date; compute active seconds per day from segments.

### 2.4 Permissions
- **Staff:** Can update only their own work status on projects they’re assigned to. When ending, can add done notes.
- **Client:** Read-only; no controls to change any staff status.
- **Admin/Manager:** Can see all; optionally allow editing member status (future).

### 2.5 UI
- **Team block:** List each team member with: name, work status pill, elapsed or total time (and “time to pause” when on hold). For current user (staff): Start / Hold / Resume / End buttons. When End: modal for “Done points” then submit.
- **Client view:** Same block, no buttons.
- **Staff view:** Same block + own controls; after End, show total time and done notes (view).
- **Day-wise & total:** Optional section or expandable row showing per-day breakdown and total hours/days.

## Phase 3 (Future)
- Client portal: allow `role=client` to see projects linked to their client record (e.g. via `users.client_id` or similar). Reuse same project detail view read-only. Update project detail page `canRead` to include client when they have access to that project.
- Project-level `staff_status` can be deprecated once per-member status is in use everywhere.

## Migration
- Run **010_project_team_member_work.sql** for per-member work status and time tracking. Without it, project detail may fail when loading team members (columns missing).
