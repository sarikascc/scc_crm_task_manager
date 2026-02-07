-- Migration 010: Per-team-member work status and time tracking
-- Depends on: 007_project_priority_team_members_and_access

-- 1. Add work tracking columns to project_team_members
ALTER TABLE public.project_team_members
  ADD COLUMN IF NOT EXISTS work_status TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS work_ended_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS work_done_notes TEXT;

ALTER TABLE public.project_team_members DROP CONSTRAINT IF EXISTS project_team_members_work_status_check;
ALTER TABLE public.project_team_members
  ADD CONSTRAINT project_team_members_work_status_check
  CHECK (work_status IN ('not_started', 'start', 'hold', 'end'));

CREATE INDEX IF NOT EXISTS idx_project_team_members_work_status ON public.project_team_members(work_status);

-- 2. Time events table for accurate timing and day-wise analytics
CREATE TABLE IF NOT EXISTS public.project_team_member_time_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('start', 'hold', 'resume', 'end')),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ptmte_project_user ON public.project_team_member_time_events(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ptmte_occurred_at ON public.project_team_member_time_events(occurred_at);

ALTER TABLE public.project_team_member_time_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read project team member time events" ON public.project_team_member_time_events;
DROP POLICY IF EXISTS "Assigned staff can insert own time events" ON public.project_team_member_time_events;

CREATE POLICY "Users can read project team member time events"
  ON public.project_team_member_time_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role IN ('admin', 'manager')
          OR COALESCE(u.module_permissions->>'projects', 'none') IN ('read', 'write')
          OR project_team_member_time_events.user_id = auth.uid()
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.project_team_members ptm
      WHERE ptm.project_id = project_team_member_time_events.project_id
        AND ptm.user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned staff can insert own time events"
  ON public.project_team_member_time_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.project_team_members ptm
      WHERE ptm.project_id = project_team_member_time_events.project_id
        AND ptm.user_id = auth.uid()
    )
  );

-- 3. Allow assigned staff to update their own project_team_members row (work_status, timestamps, notes)
DROP POLICY IF EXISTS "Assigned staff can update own work status" ON public.project_team_members;
CREATE POLICY "Assigned staff can update own work status"
  ON public.project_team_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
