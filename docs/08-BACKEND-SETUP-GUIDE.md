# Backend Implementation Guide

Complete backend setup from database to API endpoints, ready for production.

## Quick Start

### 1. Prerequisites

```bash
node --version  # v18.17+
npm --version   # v9+
```

### 2. Install Dependencies

```bash
cd backend/
npm install

# Core dependencies
npm install @prisma/client next@16.2 typescript@5
npm install zod dotenv cors

# Dev dependencies
npm install -D prisma @types/node ts-node
npm install -D jest @types/jest ts-jest
npm install -D eslint @typescript-eslint/parser
```

### 3. Environment Setup

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/family_tree_dev"
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT_MS=10000

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="30d"

# Server
NODE_ENV="development"
PORT=3001

# CORS
CORS_ORIGIN="http://localhost:3000"

# Logging
LOG_LEVEL="debug"
```

### 4. Initialize Database

```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
# Server running on http://localhost:3001
```

---

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── trees/
│   │   │   ├── route.ts                    # GET /api/trees, POST /api/trees
│   │   │   ├── [treeId]/
│   │   │   │   ├── route.ts                # GET, PATCH, DELETE /api/trees/:treeId
│   │   │   │   ├── members/
│   │   │   │   │   ├── route.ts            # POST member
│   │   │   │   │   └── [memberId]/
│   │   │   │   │       └── route.ts        # PATCH, DELETE member
│   │   │   │   ├── edges/
│   │   │   │   │   ├── route.ts            # POST edge
│   │   │   │   │   └── [edgeId]/
│   │   │   │   │       └── route.ts        # PATCH, DELETE edge
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts                # POST login
│   │   │   ├── register/
│   │   │   │   └── route.ts                # POST register
│   │   │   └── refresh/
│   │   │       └── route.ts                # POST refresh token
│   ├── middleware.ts                        # Auth, logging, CORS
│   └── globals.css
├── lib/
│   ├── prisma.ts                           # Prisma client singleton
│   ├── api-helpers.ts                      # Response transformers
│   └── auth.ts                              # JWT utilities
├── core/
│   ├── validation/
│   │   └── tree.validation.ts              # Relationship validation rules
│   ├── services/
│   │   ├── tree.service.ts                 # Tree business logic
│   │   ├── member.service.ts               # Member business logic
│   │   └── edge.service.ts                 # Relationship business logic
│   └── types/
│       └── index.ts                         # TypeScript interfaces
├── prisma/
│   ├── schema.prisma                        # ORM schema
│   ├── migrations/
│   │   └── [timestamp]_init/
│   │       └── migration.sql                # Database DDL
│   └── seed.ts                              # Initial data seeding
├── .env.local                               # Environment variables
├── next.config.ts                           # Next.js config
├── package.json
├── tsconfig.json
├── jest.config.js                           # Testing config
└── README.md
```

---

## Database Setup

### PostgreSQL Installation

**macOS (Homebrew)**:
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian**:
```bash
sudo apt install postgresql-15 postgresql-contrib-15
sudo service postgresql start
```

**Windows (Docker)**:
```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Create Database

```bash
createdb family_tree_dev
```

### Run Migrations

```bash
npx prisma migrate deploy
```

Verify:
```bash
psql family_tree_dev
\dt                    # List tables
\d family_member       # Show member schema
```

---

## API Development

### Authentication Middleware

File: `app/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const response = NextResponse.next();
    response.headers.set('X-User-Id', (decoded as any).userId);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
```

### Validation Service

File: `core/services/edge.service.ts`

```typescript
import { validateNewRelationship } from '@/core/validation/tree.validation';
import { prisma } from '@/lib/prisma';

export class EdgeService {
  async createEdge(treeId: string, payload: {
    sourceId: string;
    targetId: string;
    type: string;
    marriageYear?: number;
    divorceYear?: number;
  }) {
    // Fetch tree with all members and edges
    const tree = await prisma.familyTree.findUnique({
      where: { id: treeId },
      include: { members: true, edges: true },
    });

    if (!tree) {
      throw new Error('Tree not found');
    }

    // Validate relationship
    const validation = validateNewRelationship(tree, payload);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(firstError.code);
    }

    // Create edge
    return await prisma.familyEdge.create({
      data: {
        treeId,
        sourceId: payload.sourceId,
        targetId: payload.targetId,
        type: payload.type,
        marriageYear: payload.marriageYear || null,
        divorceYear: payload.divorceYear || null,
      },
    });
  }
}
```

---

## Testing

### Unit Tests

File: `app/api/trees/__tests__/route.test.ts`

```typescript
import { POST } from '../route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    familyTree: {
      create: jest.fn(),
    },
  },
}));

describe('POST /api/trees', () => {
  it('creates tree with valid name', async () => {
    const mockTree = {
      id: '1',
      name: 'My Family',
      description: null,
      ownerId: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.familyTree.create as jest.Mock).mockResolvedValue(mockTree);

    const request = new Request('http://localhost:3001/api/trees', {
      method: 'POST',
      headers: {
        'X-User-Id': '123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'My Family' }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(201);
  });

  it('rejects empty name', async () => {
    const request = new Request('http://localhost:3001/api/trees', {
      method: 'POST',
      headers: {
        'X-User-Id': '123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '' }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });
});
```

Run tests:
```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

## Validation Rules Implementation

All validation rules from `/docs/06-VALIDATION-RULES.md` must be implemented server-side:

### Parent Validation

```typescript
// src/core/validation/tree.validation.ts

const MAX_BIOLOGICAL_PARENTS = 2;

function validateParentLimit(tree: FamilyTree, targetId: string, type: string): ValidationError[] {
  if (type !== 'parent-child') return [];

  const bioParents = tree.edges.filter(
    (e) => e.type === 'parent-child' && e.targetId === targetId
  );

  if (bioParents.length >= MAX_BIOLOGICAL_PARENTS) {
    return [
      {
        code: 'MAX_PARENTS_EXCEEDED',
        message: 'Cannot add more than 2 biological parents',
        field: 'targetId',
      },
    ];
  }

  return [];
}
```

### Marriage Year Validation

```typescript
function validateMarriageYears(
  source: FamilyMember,
  target: FamilyMember,
  marriageYear?: number
): ValidationError[] {
  if (!marriageYear) return [];

  const errors: ValidationError[] = [];

  // Check against birth years
  if (source.birthYear && marriageYear < source.birthYear + 18) {
    errors.push({
      code: 'INVALID_MARRIAGE_YEAR',
      message: 'Marriage year must be at least 18 years after birth',
      field: 'marriageYear',
    });
  }

  return errors;
}
```

---

## Performance Optimization

### Database Indices

Already defined in `/docs/03-DATABASE-MIGRATIONS.sql`:

```sql
CREATE INDEX idx_family_edge_source_target ON family_edge(source_id, target_id);
CREATE INDEX idx_family_member_tree ON family_member(tree_id);
```

### Query Optimization

```typescript
// ✅ GOOD: Single query with includes
const tree = await prisma.familyTree.findUnique({
  where: { id: treeId },
  include: {
    members: true,
    edges: true,
  },
});

// ❌ BAD: Multiple queries
const tree = await prisma.familyTree.findUnique({ where: { id: treeId } });
const members = await prisma.familyMember.findMany({ where: { treeId } });
const edges = await prisma.familyEdge.findMany({ where: { treeId } });
```

### Connection Pooling

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}?maxConnections=${process.env.DATABASE_POOL_SIZE}`,
    },
  },
});

export { prisma };
```

---

## Deployment

### Docker

File: `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://prod_user:secure_pass@db.production.com:5432/family_tree"
NODE_ENV="production"
JWT_SECRET="use-aws-secrets-manager"
LOG_LEVEL="info"
```

### Vercel Deployment

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel deploy --prod
```

---

## Monitoring & Logging

### Structured Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => console.log(JSON.stringify({ level: 'info', msg, ...data })),
  error: (msg: string, error?: any) => console.error(JSON.stringify({ level: 'error', msg, error })),
  warn: (msg: string, data?: any) => console.warn(JSON.stringify({ level: 'warn', msg, ...data })),
};
```

### Error Tracking

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## Checklist Before Production

- [ ] All 14 validation rules implemented server-side (from /docs/06-VALIDATION-RULES.md)
- [ ] Database migrations tested on staging database
- [ ] Authentication middleware properly validates JWT tokens
- [ ] CORS configured correctly for frontend domain
- [ ] Connection pooling set up (20+ connections recommended)
- [ ] Error responses follow OpenAPI spec format
- [ ] Request/response logging in place
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] Load testing completed (min 1000 req/s)
- [ ] Database backups configured
- [ ] Monitoring/alerts set up (Sentry, DataDog, etc.)
- [ ] SSL/TLS configured on production domain

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server

# Database
npx prisma studio            # Open Prisma UI
npx prisma db push           # Push schema changes
npx prisma migrate dev       # Create new migration
npx prisma db seed           # Seed initial data

# Testing
npm test                      # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report

# Linting
npm run lint                  # Run ESLint
npm run lint:fix             # Fix lint issues

# Deployment
npm run build && npm start   # Production
docker build -t family-tree . # Docker build
```

---

## Troubleshooting

### Issue: "P2002: Unique constraint failed"

**Cause**: Duplicate entry in unique field  
**Solution**: Check for existing records; use upsert if appropriate

```typescript
await prisma.familyTree.upsert({
  where: { id: treeId },
  update: { name: 'New Name' },
  create: { id: treeId, name: 'New Tree', ownerId },
});
```

### Issue: "P2025: An operation failed because it depends on record that was required but not found"

**Cause**: Foreign key reference missing  
**Solution**: Verify parent records exist before create/update

```typescript
const member = await prisma.familyMember.findUnique({ where: { id: memberId } });
if (!member) throw new Error('Member not found');
```

### Issue: Database connection timeout

**Cause**: Connection pool exhausted  
**Solution**: Increase pool size or reduce concurrent connections

```env
DATABASE_POOL_SIZE=30  # Increase from 20
```

---

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

**Last Updated**: 2024-12-19  
**Backend Team**: Ready to implement from these specifications
