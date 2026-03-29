# Data Model - Family Tree Backend

## Overview

The family tree system uses a **graph-based data model** with nodes (members) and edges (relationships).

### Core Concepts

```
┌─────────────────────────────────────────────────────────┐
│                    FamilyTree                           │
│  - id, name, description, owner_id, created_at         │
│  - ownerId links to User (future auth integration)      │
└─────────────────────────────────────────────────────────┘
         │
         ├─ 1:N ─→ Members (Nodes)
         │         - id, name, gender, birthYear, deathYear
         │         - birthPlace, note, avatarUrl
         │         - timestamps (createdAt, updatedAt)
         │
         └─ 1:N ─→ Edges (Relationships)
                   - source_id → Member
                   - target_id → Member
                   - type: parent-child | adoptive-parent | spouse | sibling-bond
                   - metadata: marriageYear, divorceYear, adoptionYear, bondYear
```

## Data Model Details

### 1. FamilyTree (Container)
```
id: UUID (PK)
name: string
description: string?
owner_id: integer (FK → users.id)
created_at: timestamp
updated_at: timestamp
```

### 2. FamilyMember (Node - represents a person)
```
id: UUID (PK)
tree_id: UUID (FK → trees.id)
name: string
gender: enum('male', 'female', 'unknown')
birth_year: integer?
death_year: integer?
birth_place: string?
note: string?
avatar_url: string?
created_at: timestamp
updated_at: timestamp
```

### 3. FamilyEdge (Relationship - represents a connection)
```
id: UUID (PK)
tree_id: UUID (FK → trees.id)
source_id: UUID (FK → members.id)
target_id: UUID (FK → members.id)
type: enum('parent-child', 'adoptive-parent', 'spouse', 'sibling-bond')
marriage_year: integer?        -- for spouse
divorce_year: integer?         -- for spouse
adoption_year: integer?        -- for adoptive-parent
bond_year: integer?            -- for sibling-bond
created_at: timestamp
updated_at: timestamp
```

## Relationship Types & Semantics

### parent-child
- **Direction**: source → target
- **Meaning**: source is a biological parent of target
- **Constraints**:
  - target can have at most 2 parent-child edges (1 father, 1 mother)
  - No cycles allowed (parent ≠ child descendant)
- **Years**: none (bio parent relationship has no year metadata)

### adoptive-parent
- **Direction**: source → target
- **Meaning**: source is an adoptive parent of target
- **Constraints**:
  - target can have unlimited adoptive-parent edges
  - Adoption year should be valid (≥ 1800, ≤ current year + 1)
- **Years**: adoption_year (optional)

### spouse
- **Direction**: source ↔ target (undirected semantically)
- **Meaning**: source and target are/were married
- **Constraints**:
  - No time-overlap for active marriages (period without divorce_year)
  - Age difference: should be consistent with births
  - Duplicate prevention: unique(tree_id, min(source, target), max(source, target), 'spouse')
- **Years**: marriage_year (optional), divorce_year (optional)
- **Note**: Stored with direction source → target; UI should check both directions when querying

### sibling-bond
- **Direction**: source ↔ target (undirected semantically)
- **Meaning**: source and target are bonded as siblings (fraternal/sisterly tie, not necessarily bio)
- **Constraints**: no special constraints
- **Years**: bond_year (optional)
- **Note**: Often used for adopted siblings, sworn siblings, etc.

## Key Business Rules (enforced server-side)

1. **Self-relation prevention**: source ≠ target
2. **Duplicate edges**: Unique constraint on (tree_id, source_id, target_id, type)
3. **Cycle detection**: No circular ancestry (parent → child chain must be acyclic)
4. **Biological parent limit**: target can have max 2 parent-child edges
5. **Adoptive parent limit**: unlimited (no max)
6. **Spouse overlap**: No active marriage overlap for same person
7. **Age consistency**: Parent must be ≥ 13 years older than child
8. **Year validity**: All year fields must be 1800 ≤ year ≤ current_year + 1

## Example Data Structure (Single Tree)

```json
{
  "tree": {
    "id": "tree-01",
    "name": "Gia phả nhà Nguyễn",
    "description": "Family tree from 1920s",
    "owner_id": 1,
    "created_at": "2025-01-01T00:00:00Z"
  },
  "members": [
    {
      "id": "mb-01",
      "tree_id": "tree-01",
      "name": "Nguyễn Văn Tổ",
      "gender": "male",
      "birth_year": 1920,
      "death_year": 1995,
      "birth_place": "Hà Nội"
    },
    {
      "id": "mb-05",
      "tree_id": "tree-01",
      "name": "Nguyễn Văn An",
      "gender": "male",
      "birth_year": 1980
    }
  ],
  "edges": [
    {
      "id": "e-01",
      "tree_id": "tree-01",
      "source_id": "mb-01",
      "target_id": "mb-03",
      "type": "parent-child"
    },
    {
      "id": "e-06",
      "tree_id": "tree-01",
      "source_id": "mb-03",
      "target_id": "mb-04",
      "type": "spouse",
      "marriage_year": 1978
    }
  ]
}
```

## Frontend → Backend Mapping

| Frontend Type | Backend Type | Mapping |
|---|---|---|
| `FamilyTree` | `Tree` entity | 1:1 |
| `FamilyMember` | `Member` entity | 1:1 |
| `FamilyEdge` | `Edge` entity | 1:1 |
| `Gender` | `ENUM('male','female','unknown')` | 1:1 |
| `RelationshipType` | `ENUM('parent-child','adoptive-parent','spouse','sibling-bond')` | 1:1 |

**Field name conventions:**
- Frontend uses camelCase (createdAt) → Backend uses snake_case (created_at)
- Transformation layer in API middleware handles conversion

## Query Patterns (for Backend API)

1. **Get full tree**: fetch tree + all members + all edges
2. **Get person's parents**: query edges where target_id = person_id AND (type = 'parent-child' OR 'adoptive-parent')
3. **Get person's children**: query edges where source_id = person_id AND (type = 'parent-child' OR 'adoptive-parent')
4. **Get person's spouses**: query edges where (source_id = person_id OR target_id = person_id) AND type = 'spouse'
5. **Check duplicate edge**: query edges with matching (tree_id, source_id, target_id, type)
6. **Detect cycle**: DFS from target upward via parent-child/adoptive-parent edges; if reach source → cycle

---

**Next Steps**: See `02-DATABASE-SCHEMA.prisma` for Prisma model definitions, and `03-DATABASE-MIGRATIONS.sql` for SQL DDL.
