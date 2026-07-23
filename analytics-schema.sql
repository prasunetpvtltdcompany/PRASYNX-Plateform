-- Analytics & Custom Dashboards Schema for Prasunet ERP
-- Advanced analytics, custom dashboards, and saved reports
-- Run this in Supabase SQL Editor

-- 1. ANALYTICS DASHBOARDS (user-created custom dashboards)
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_org ON analytics_dashboards(organisation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_creator ON analytics_dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_default ON analytics_dashboards(is_default) WHERE is_default = true;

-- 2. ANALYTICS WIDGETS (individual widgets/charts within dashboards)
CREATE TABLE IF NOT EXISTS analytics_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('kpi', 'line_chart', 'bar_chart', 'pie_chart', 'table', 'number', 'area_chart', 'heatmap', 'funnel', 'metric', 'custom')),
  title TEXT NOT NULL,
  subtitle TEXT,
  data_source TEXT NOT NULL,
  query_config JSONB NOT NULL DEFAULT '{}',
  visualization_config JSONB DEFAULT '{}',
  position JSONB NOT NULL DEFAULT '{}',
  size JSONB NOT NULL DEFAULT '{"w": 1, "h": 1}',
  refresh_interval INTEGER DEFAULT 0,
  cache_ttl INTEGER DEFAULT 300,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_widgets_dashboard ON analytics_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_analytics_widgets_type ON analytics_widgets(widget_type);

-- 3. ANALYTICS REPORTS (saved report configurations)
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('tabular', 'summary', 'comparison', 'trend', 'custom')),
  data_source TEXT NOT NULL,
  query_config JSONB NOT NULL DEFAULT '{}',
  columns_config JSONB DEFAULT '[]',
  filters JSONB DEFAULT '[]',
  sort_config JSONB DEFAULT '{}',
  schedule_config JSONB DEFAULT '{}',
  format_config JSONB DEFAULT '{}',
  is_scheduled BOOLEAN DEFAULT false,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_reports_org ON analytics_reports(organisation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_creator ON analytics_reports(created_by);

-- 4. ANALYTICS DATA SOURCES (configurable data connections)
CREATE TABLE IF NOT EXISTS analytics_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('database', 'api', 'csv', 'supabase', 'external', 'custom')),
  connection_config JSONB NOT NULL DEFAULT '{}',
  tables JSONB DEFAULT '[]',
  refresh_strategy TEXT DEFAULT 'manual' CHECK (refresh_strategy IN ('manual', 'scheduled', 'realtime')),
  refresh_interval INTEGER DEFAULT 3600,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_data_sources_org ON analytics_data_sources(organisation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_sources_type ON analytics_data_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_analytics_data_sources_active ON analytics_data_sources(is_active) WHERE is_active = true;
