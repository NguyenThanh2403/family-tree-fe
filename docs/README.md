# Documentation Suite - Family Tree Backend

Complete backend specification and implementation guide. This directory contains everything needed to build and deploy the Family Tree API.

## 📚 Documentation Files Overview

### 1. **01-DATA-MODEL.md** — Conceptual Foundation
**Purpose**: Understand the domain model and business logic  
**Contains**:
- System overview (graph-based family tree model)
- Entity definitions (FamilyTree, FamilyMember, FamilyEdge)
- Relationship type semantics (parent-child, spouse, adoptive-parent, sibling-bond)
- 7 business rules (e.g., "A person has max 2 bio parents but unlimited adoptive parents")
- 6 query patterns (ancestors, descendants, spouse pairs, etc.)
- Example JSON payloads

**Read this when**: You're new to the backend team or need to understand domain constraints

---

### 2. **02-DATABASE-SCHEMA.prisma** — ORM Definitions
**Purpose**: Prisma schema for type-safe database access  
**Contains**:
- 4 Prisma models: User, FamilyTree, FamilyMember, FamilyEdge
- 2 enums: Gender (MALE/FEMALE/UNKNOWN), RelationshipType (parent-child/adoptive-parent/spouse/sibling-bond)
- Field definitions with validation (email unique, name required, year ranges, etc.)
- Relations and indexes for query performance
- Cascade delete rules for referential integrity

**Read this when**: Setting up Prisma migrations or implementing CRUD operations

**Usage**:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### 3. **03-DATABASE-MIGRATIONS.sql** — PostgreSQL DDL
**Purpose**: Raw SQL for database creation and version control  
**Contains**:
- PostgreSQL CREATE ENUM statements (Gender, RelationshipType)
- CREATE TABLE for all 4 core entities
- Constraints (NOT NULL, UNIQUE, FOREIGN KEY, CHECK)
- Indices for query optimization
- Helper VIEWs (v_all_parents, v_spouse_pairs)
- Triggers for auto-updating updated_at timestamps
- Rollback comments for each migration

**Read this when**: Setting up the database or reviewing schema changes

**Usage**:
```bash
psql family_tree_dev < doc/03-DATABASE-MIGRATIONS.sql
```

---

### 4. **04-OPENAPI-SPEC.yaml** — API Contract
**Purpose**: Complete API specification (OpenAPI 3.0.3 format)  
**Contains**:
- 10 endpoints: GET/POST/PATCH/DELETE for trees, members, edges
- Request/response schemas for each endpoint
- 15+ schema definitions with validation rules
- 5 response types: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found
- Error codes and messages (e.g., MAX_PARENTS_EXCEEDED, CYCLE_DETECTED)
- Example responses for each endpoint
- Security scheme (Bearer token JWT)

**Read this when**: Building frontend API client or integrating with API gateway

**Validation** errors are returned with full context:
```json
{
  "result": null,
  "validation": {
    "valid": false,
    "errors": [
      {
        "code": "MAX_PARENTS_EXCEEDED",
        "message": "Cannot add more than 2 biological parents",
        "field": "targetId"
      }
    ]
  }
}
```

---

### 5. **05-API-EXAMPLES.md** — Real Request/Response Patterns
**Purpose**: Concrete examples of all API operations  
**Contains**:
- 7+ CRUD examples with actual JSON payloads
- Success cases (create tree, add member, create relationship, update edge)
- 3+ validation failure cases (MAX_PARENTS_EXCEEDED, SPOUSE_TIME_OVERLAP, DUPLICATE_RELATION)
- Error response examples (400, 404, 409, 422)
- Batch operation patterns (transactional create member + edge)
- Query parameter examples (filter, pagination)

**Read this when**: Testing API, debugging issues, or implementing client code

**Example**:
```bash
# POST create spouse relationship
curl -X POST http://localhost:3001/api/trees/1/edges \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "p1",
    "targetId": "p2",
    "type": "spouse",
    "marriageYear": 2015,
    "divorceYear": null
  }'
```

---

### 6. **06-VALIDATION-RULES.md** — Error Reference
**Purpose**: Exhaustive validation rules and error codes  
**Contains**:
- 14 error codes with definitions:
  - **Relationship level** (7): SELF_RELATION, DUPLICATE_RELATION, CYCLE_DETECTED, MAX_PARENTS_EXCEEDED, SPOUSE_TIME_OVERLAP, AGE_INCONSISTENCY, INVALID_DIVORCE_YEAR
  - **Adoption level** (1): INVALID_ADOPTION_YEAR
  - **Marriage level** (2): INVALID_MARRIAGE_YEAR, INVALID_DIVORCE_YEAR
  - **Member level** (4): NAME_TOO_SHORT, INVALID_BIRTH_YEAR, INVALID_DEATH_YEAR, INVALID_GENDER

- For each error: condition (when it triggers), error message, affected field, example ❌/✅ scenarios
- Constants documentation (MIN_PARENT_AGE_DIFF=13, VALID_YEAR_RANGE=[1000, currentYear+1])
- Implementation checklist (12 backend checks, 5 frontend checks, 8 DB constraints)
- Testing scenarios (6 happy path cases, 10 edge case failures)

**Read this when**: Implementing validation, debugging validation errors, writing tests

**Key validations**:
```
MAX_PARENTS_EXCEEDED
  ├─ When: targetId already has 2 parent-child edges
  ├─ Not applied: for adoptive-parent type
  └─ Solution: check edges before POST to /trees/{id}/edges

CYCLE_DETECTED
  ├─ When: adding edge would create circular family tree
  ├─ Algorithm: DFS/BFS from source to target
  └─ Example: A→B→C→(add C→A) ❌

SPOUSE_TIME_OVERLAP
  ├─ When: both spouses were already married at marriageYear
  ├─ Check: existing spouse edges with marriageYear <= new_marriageYear
  └─ Exception: if divorced before new marriage
```

---

### 7. **07-BACKEND-ROUTES-EXAMPLE.ts** — Next.js API Implementation
**Purpose**: Complete working examples of all API route handlers  
**Contains**:
- All 10 endpoint implementations (GET, POST, PATCH, DELETE)
- Proper error handling and HTTP status codes
- Authorization checks (X-User-Id header)
- Input validation
- Prisma query patterns
- Response transformation (camelCase/snake_case)
- Helper functions and middleware

**Read this when**: Implementing backend routes, copy-pasting code patterns

**Structure**:
```
app/api/
├── trees/route.ts                    # GET, POST trees
├── trees/[treeId]/route.ts           # GET, PATCH, DELETE tree
├── trees/[treeId]/members/route.ts   # POST member
├── trees/[treeId]/members/[memberId]/route.ts
├── trees/[treeId]/edges/route.ts     # POST edge
└── trees/[treeId]/edges/[edgeId]/route.ts
```

**Key pattern** (validation integration):
```typescript
const validation = validateNewRelationship(tree, {
  sourceId, targetId, type, marriageYear, divorceYear
});

if (!validation.valid) {
  return NextResponse.json({
    result: null,
    validation
  }, { status: 201 });
}
```

---

### 8. **08-BACKEND-SETUP-GUIDE.md** — Deployment & Operations
**Purpose**: From zero to production step-by-step  
**Contains**:
- Quick start (npm install, .env, migrations, npm run dev)
- Directory structure
- PostgreSQL setup (Homebrew, Docker, etc.)
- Database initialization
- Environment variables documentation
- Authentication middleware code
- Validation service example
- Unit & integration testing examples
- Performance optimization (indices, connection pooling, query patterns)
- Docker deployment (Dockerfile, docker-compose)
- Monitoring & logging setup
- Pre-production checklist
- Troubleshooting (common errors and solutions)
- Useful commands reference

**Read this when**: Setting up development/production environment, deploying

**Quick start**:
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with DATABASE_URL, JWT_SECRET

# 3. Initialize database
npx prisma migrate deploy

# 4. Start server
npm run dev
```

---

## 🎯 Implementation Workflow

### Phase 1: Planning (Use files 1-2)
- Read **01-DATA-MODEL.md** → Understand business logic
- Review **02-DATABASE-SCHEMA.prisma** → See ORM definitions

### Phase 2: Setup (Use file 8)
- Follow **08-BACKEND-SETUP-GUIDE.md** → Set up environment
- Create database and run migrations

### Phase 3: Development (Use files 4-7)
- Review **04-OPENAPI-SPEC.yaml** → API contract
- Use **07-BACKEND-ROUTES-EXAMPLE.ts** → Copy implementations
- Reference **05-API-EXAMPLES.md** → Example payloads
- Test against **06-VALIDATION-RULES.md** → Validation cases

### Phase 4: Testing (Use files 5-6)
- Write tests from **05-API-EXAMPLES.md** → Happy path + error cases
- Validate against **06-VALIDATION-RULES.md** → All 14 error codes

### Phase 5: Deployment (Use file 8)
- Follow checklist → Pre-production validation
- Use Docker → Container deployment
- Monitor → Logging & alerts

---

## 📋 Quick Reference

### Error Codes (14 total)
| Code | When | Field |
|------|------|-------|
| SELF_RELATION | source === target | targetId |
| DUPLICATE_RELATION | edge already exists | targetId |
| CYCLE_DETECTED | would create cycle | targetId |
| MAX_PARENTS_EXCEEDED | 2+ parent-child edges | targetId |
| SPOUSE_TIME_OVERLAP | overlapping marriages | marriageYear |
| AGE_INCONSISTENCY | source age < 13 at marriage | sourceId |
| INVALID_DIVORCE_YEAR | divorce < marriage year | divorceYear |
| INVALID_ADOPTION_YEAR | before birth | adoptionYear |
| INVALID_MARRIAGE_YEAR | before age 18 | marriageYear |
| NAME_TOO_SHORT | < 2 characters | name |
| INVALID_BIRTH_YEAR | not 1000-currentYear | birthYear |
| INVALID_DEATH_YEAR | < birth year | deathYear |
| INVALID_GENDER | not M/F/Unknown | gender |

### Key Constants
- **MIN_PARENT_AGE_DIFF**: 13 years (parent/child age gap)
- **MAX_BIO_PARENTS**: 2 per child
- **MAX_ADOPTIVE_PARENTS**: Unlimited
- **MIN_MARRIAGE_AGE**: 18 years old
- **VALID_YEAR_RANGE**: [1000, currentYear+1]

### Database Indices
- `family_edge(source_id, target_id)` — Optimize cycle detection queries
- `family_member(tree_id)` — Optimize tree queries
- Auto-created on `id` (primary key)

### API Response Format
```json
{
  "result": { ...entity },
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

Or on validation failure:
```json
{
  "result": null,
  "validation": {
    "valid": false,
    "errors": [
      {
        "code": "ERROR_CODE",
        "message": "Human readable message",
        "field": "fieldName"
      }
    ]
  }
}
```

---

## 🔍 How to Use This Suite

### 1️⃣ "I need to understand the domain"
→ Read **01-DATA-MODEL.md**

### 2️⃣ "I need to set up the database"
→ Follow **08-BACKEND-SETUP-GUIDE.md** sections "Database Setup" and "Migrations"

### 3️⃣ "I'm implementing an API endpoint"
→ Copy code from **07-BACKEND-ROUTES-EXAMPLE.ts**, reference **04-OPENAPI-SPEC.yaml**

### 4️⃣ "I need to debug a validation error"
→ Look up error code in **06-VALIDATION-RULES.md**, check example in **05-API-EXAMPLES.md**

### 5️⃣ "I'm testing the API"
→ Use curl commands from **05-API-EXAMPLES.md**, verify all error codes from **06-VALIDATION-RULES.md**

### 6️⃣ "I'm deploying to production"
→ Follow **08-BACKEND-SETUP-GUIDE.md** sections "Deployment" and "Checklist"

### 7️⃣ "I need to add a new validation rule"
→ Update **06-VALIDATION-RULES.md**, implement in backend, add test case to **05-API-EXAMPLES.md**

---

## ✅ Implementation Verification

Before deploying, verify:

- [ ] All 14 validation errors from **06-VALIDATION-RULES.md** implemented server-side
- [ ] All 10 endpoints from **04-OPENAPI-SPEC.yaml** working
- [ ] All response formats match **05-API-EXAMPLES.md**
- [ ] Database migrations created and tested (**03-DATABASE-MIGRATIONS.sql**)
- [ ] Authorization middleware in place
- [ ] Error responses include validation context (result + validation object)
- [ ] Unit tests pass (>80% coverage)
- [ ] Load test completed (>1000 req/s)
- [ ] Monitoring/logging configured
- [ ] Database backups enabled

---

## 📊 Statistics

| Document | Lines | Key Content |
|----------|-------|-------------|
| 01-DATA-MODEL.md | 464 | 7 business rules, 6 query patterns |
| 02-DATABASE-SCHEMA.prisma | 84 | 4 models, 2 enums |
| 03-DATABASE-MIGRATIONS.sql | 240 | 4 tables, views, triggers, indices |
| 04-OPENAPI-SPEC.yaml | 580 | 10 endpoints, 15+ schemas |
| 05-API-EXAMPLES.md | 420 | 7+ CRUD examples, 3+ error cases |
| 06-VALIDATION-RULES.md | 450 | 14 error codes, testing scenarios |
| 07-BACKEND-ROUTES-EXAMPLE.ts | 380 | All route implementations |
| 08-BACKEND-SETUP-GUIDE.md | 520 | Setup, deployment, troubleshooting |
| **TOTAL** | **~3,100** | **Complete backend specification** |

---

## 🚀 Get Started

```bash
# 1. Read the overview
cat 01-DATA-MODEL.md

# 2. Set up environment
bash 08-BACKEND-SETUP-GUIDE.md

# 3. Run migrations
npx prisma migrate deploy

# 4. Start coding
cp 07-BACKEND-ROUTES-EXAMPLE.ts app/api/trees/route.ts

# 5. Test
npm test

# 6. Deploy
docker build -t family-tree . && docker push your-registry/family-tree
```

---

## 📞 Support

For questions about:
- **Data model**: See 01-DATA-MODEL. md
- **Database setup**: See 08-BACKEND-SETUP-GUIDE.md (Database section)
- **API endpoints**: See 04-OPENAPI-SPEC.yaml
- **Validation errors**: See 06-VALIDATION-RULES.md
- **Implementation examples**: See 07-BACKEND-ROUTES-EXAMPLE.ts
- **Testing/deployment**: See 08-BACKEND-SETUP-GUIDE.md (Testing/Deployment sections)

---

**Status**: ✅ Complete and ready for backend team implementation  
**Last Updated**: 2024-12-19  
**Audience**: Backend engineers, DevOps, QA testers

---

## File Dependencies

```
01-DATA-MODEL.md (foundation)
    ↓
02-DATABASE-SCHEMA.prisma (ORM models)
    ↓
03-DATABASE-MIGRATIONS.sql (SQL DDL)
    ↓
04-OPENAPI-SPEC.yaml (API contract)
    ├→ 05-API-EXAMPLES.md (concrete examples)
    ├→ 06-VALIDATION-RULES.md (error reference)
    └→ 07-BACKEND-ROUTES-EXAMPLE.ts (implementation)
        ↓
08-BACKEND-SETUP-GUIDE.md (deployment)
```

Best practice: Read linearly (1→8) for first-time setup, then use as reference by topic.
