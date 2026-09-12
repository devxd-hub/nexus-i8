export const MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS _migrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  executed_at TEXT NOT NULL
);
`;

export const INITIAL_SCHEMA_SQL = `
-- 1. MEMBERS
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  public_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL,
  domain TEXT,
  bio TEXT,
  photo_url TEXT,
  image_position TEXT,
  social_links TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  joined_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_members_public_id ON members(public_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  project_number TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  year TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  disciplines TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  featured INTEGER NOT NULL DEFAULT 0,
  technologies TEXT NOT NULL DEFAULT '[]',
  deliverables TEXT,
  cover_image TEXT,
  demo_url TEXT,
  repository_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

-- 3. PROJECT MEMBERS (Junction table with foreign keys)
CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  role TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (project_id, member_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_members_member ON project_members(member_id);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  registration_url TEXT,
  cover_image TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Upcoming',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- 5. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Normal',
  publish_status TEXT NOT NULL DEFAULT 'published',
  published_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_publish_status ON announcements(publish_status);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at);

-- 6. ARCHIVE ITEMS
CREATE TABLE IF NOT EXISTS archive_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  caption TEXT NOT NULL,
  media_reference TEXT NOT NULL,
  aspect_ratio TEXT,
  author TEXT,
  location TEXT,
  related_project_id TEXT,
  related_event_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_archive_category ON archive_items(category);
CREATE INDEX IF NOT EXISTS idx_archive_year ON archive_items(year);
CREATE INDEX IF NOT EXISTS idx_archive_project ON archive_items(related_project_id);
CREATE INDEX IF NOT EXISTS idx_archive_event ON archive_items(related_event_id);

-- 7. RESOURCES
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  published_status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(published_status);

-- 8. RECRUITMENT / CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT,
  metadata TEXT,
  status TEXT NOT NULL DEFAULT 'Unread',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- 9. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  storage_key TEXT UNIQUE NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_assets_storage_key ON media_assets(storage_key);
CREATE INDEX IF NOT EXISTS idx_media_assets_mime_type ON media_assets(mime_type);

-- 10. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL
);
`;
