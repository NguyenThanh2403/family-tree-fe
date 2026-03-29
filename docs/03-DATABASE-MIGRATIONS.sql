-- ============================================================
-- Migration: Create Family Tree Tables
-- ============================================================
-- This migration creates the core schema for the family tree application.
-- Run this after: users table already exists (or create it first if starting fresh)

-- Create ENUM types (PostgreSQL specific)
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');
CREATE TYPE relationship_type_enum AS ENUM ('parent-child', 'adoptive-parent', 'spouse', 'sibling-bond');

-- ============================================================
-- trees table
-- ============================================================
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT tree_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_trees_owner_id ON trees(owner_id);

-- ============================================================
-- members table
-- ============================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  gender gender_enum DEFAULT 'UNKNOWN',
  birth_year INTEGER CHECK (birth_year IS NULL OR (birth_year >= 1000 AND birth_year <= 2100)),
  death_year INTEGER CHECK (death_year IS NULL OR (death_year >= 1000 AND death_year <= 2100)),
  birth_place VARCHAR(255),
  note TEXT,
  avatar_url VARCHAR(512),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT member_tree_fk FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE,
  CONSTRAINT member_valid_years CHECK (
    death_year IS NULL OR birth_year IS NULL OR death_year > birth_year
  )
);
CREATE INDEX idx_members_tree_id ON members(tree_id);
CREATE UNIQUE INDEX idx_members_tree_id_member_id ON members(tree_id, id);

-- ============================================================
-- edges table
-- ============================================================
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type relationship_type_enum NOT NULL,
  marriage_year INTEGER CHECK (marriage_year IS NULL OR (marriage_year >= 1000 AND marriage_year <= 2100)),
  divorce_year INTEGER CHECK (divorce_year IS NULL OR (divorce_year >= 1000 AND divorce_year <= 2100)),
  adoption_year INTEGER CHECK (adoption_year IS NULL OR (adoption_year >= 1000 AND adoption_year <= 2100)),
  bond_year INTEGER CHECK (bond_year IS NULL OR (bond_year >= 1000 AND bond_year <= 2100)),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT edge_tree_fk FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE,
  CONSTRAINT edge_source_fk FOREIGN KEY (source_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT edge_target_fk FOREIGN KEY (target_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT edge_no_self_relation CHECK (source_id != target_id),
  CONSTRAINT edge_valid_divorce CHECK (divorce_year IS NULL OR marriage_year IS NULL OR divorce_year > marriage_year)
);
CREATE UNIQUE INDEX idx_edges_no_duplicate ON edges(tree_id, source_id, target_id, type);
CREATE INDEX idx_edges_tree_id ON edges(tree_id);
CREATE INDEX idx_edges_source_id ON edges(source_id);
CREATE INDEX idx_edges_target_id ON edges(target_id);

-- ============================================================
-- Helper Views (optional, for query performance)
-- ============================================================

-- View: All "parent-like" relationships (both bio and adoptive)
CREATE VIEW v_all_parents AS
SELECT 
  tree_id, source_id as parent_id, target_id as child_id, 
  type as relationship_type
FROM edges
WHERE type IN ('parent-child', 'adoptive-parent');

-- View: All spouse records (normalized to handle both directions)
CREATE VIEW v_spouse_pairs AS
SELECT 
  tree_id, 
  LEAST(source_id, target_id) as person_a_id,
  GREATEST(source_id, target_id) as person_b_id,
  marriage_year, divorce_year
FROM edges
WHERE type = 'spouse';

-- ============================================================
-- Triggers (optional, for audit/timestamps)
-- ============================================================

-- Auto-update updated_at on modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trees_updated_at BEFORE UPDATE ON trees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edges_updated_at BEFORE UPDATE ON edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Rollback Script (if needed)
-- ============================================================
-- DROP TRIGGER IF EXISTS update_edges_updated_at ON edges;
-- DROP TRIGGER IF EXISTS update_members_updated_at ON members;
-- DROP TRIGGER IF EXISTS update_trees_updated_at ON trees;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP VIEW IF EXISTS v_spouse_pairs;
-- DROP VIEW IF EXISTS v_all_parents;
-- DROP TABLE IF EXISTS edges;
-- DROP TABLE IF EXISTS members;
-- DROP TABLE IF EXISTS trees;
-- DROP TYPE IF EXISTS relationship_type_enum;
-- DROP TYPE IF EXISTS gender_enum;
