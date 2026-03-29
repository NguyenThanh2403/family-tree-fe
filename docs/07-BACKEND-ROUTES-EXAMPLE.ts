// ============================================================
// Backend API Routes - Example Implementation (Next.js API Routes)
// ============================================================

// File structure (recommended):
// app/api/trees/route.ts                    (GET, POST /api/trees)
// app/api/trees/[treeId]/route.ts           (GET, PATCH, DELETE /api/trees/:treeId)
// app/api/trees/[treeId]/members/route.ts   (POST /api/trees/:treeId/members)
// app/api/trees/[treeId]/members/[memberId]/route.ts
// app/api/trees/[treeId]/edges/route.ts     (POST /api/trees/:treeId/edges)
// app/api/trees/[treeId]/edges/[edgeId]/route.ts

// ============================================================
// 1. Trees - List & Create
// ============================================================

// app/api/trees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateMember } from '@/core/validation/tree.validation';

// GET /api/trees
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('X-User-Id'); // From middleware/auth
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const trees = await prisma.familyTree.findMany({
      where: { ownerId: parseInt(userId) },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.familyTree.count({
      where: { ownerId: parseInt(userId) },
    });

    return NextResponse.json({ data: trees, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/trees
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be non-empty' },
        { status: 400 }
      );
    }

    const tree = await prisma.familyTree.create({
      data: {
        name: name.trim(),
        description: description?.trim() ?? null,
        ownerId: parseInt(userId),
      },
      include: {
        members: true,
        edges: true,
      },
    });

    return NextResponse.json(tree, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tree' }, { status: 500 });
  }
}

// ============================================================
// 2. Tree - Get, Update, Delete
// ============================================================

// app/api/trees/[treeId]/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tree = await prisma.familyTree.findFirst({
      where: {
        id: params.treeId,
        ownerId: parseInt(userId),
      },
      include: {
        members: true,
        edges: true,
      },
    });

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    return NextResponse.json(tree, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description } = body;

    // Verify ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
    });

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    const updated = await prisma.familyTree.update({
      where: { id: params.treeId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
      },
      include: { members: true, edges: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tree' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
    });

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    await prisma.familyTree.delete({ where: { id: params.treeId } });
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tree' }, { status: 500 });
  }
}

// ============================================================
// 3. Members - Create, Update, Delete
// ============================================================

// app/api/trees/[treeId]/members/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify tree ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
    });
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    const body = await req.json();
    const { name, gender, birthYear, deathYear, birthPlace, note, avatarUrl } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!gender || !['male', 'female', 'unknown'].includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
    }

    // Validate years
    const errors: any[] = [];
    if (birthYear && (birthYear < 1000 || birthYear > new Date().getFullYear())) {
      errors.push({ code: 'INVALID_BIRTH_YEAR', field: 'birthYear' });
    }
    if (deathYear && (deathYear < 1000 || deathYear > new Date().getFullYear() + 1)) {
      errors.push({ code: 'INVALID_DEATH_YEAR', field: 'deathYear' });
    }
    if (birthYear && deathYear && deathYear <= birthYear) {
      errors.push({ code: 'INVALID_DEATH_YEAR', field: 'deathYear' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const member = await prisma.familyMember.create({
      data: {
        treeId: params.treeId,
        name: name.trim(),
        gender,
        birthYear: birthYear ? parseInt(birthYear) : null,
        deathYear: deathYear ? parseInt(deathYear) : null,
        birthPlace: birthPlace?.trim() ?? null,
        note: note?.trim() ?? null,
        avatarUrl: avatarUrl ?? null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}

// app/api/trees/[treeId]/members/[memberId]/route.ts
export async function PATCH(
  req: NextRequest,
  { params }: { params: { treeId: string; memberId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify tree ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
    });
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    // Verify member belongs to tree
    const member = await prisma.familyMember.findFirst({
      where: { id: params.memberId, treeId: params.treeId },
    });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const body = await req.json();
    const updated = await prisma.familyMember.update({
      where: { id: params.memberId },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.gender && { gender: body.gender }),
        ...(body.birthYear !== undefined && { birthYear: body.birthYear }),
        ...(body.deathYear !== undefined && { deathYear: body.deathYear }),
        ...(body.birthPlace !== undefined && { birthPlace: body.birthPlace?.trim() ?? null }),
        ...(body.note !== undefined && { note: body.note?.trim() ?? null }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl ?? null }),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { treeId: string; memberId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify tree ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
    });
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    await prisma.familyMember.delete({ where: { id: params.memberId } });
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}

// ============================================================
// 4. Edges (Relationships) - Create, Update, Delete
// ============================================================

// app/api/trees/[treeId]/edges/route.ts
import { validateNewRelationship } from '@/core/validation/tree.validation';

export async function POST(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify tree ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
      include: { members: true, edges: true },
    });
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    const body = await req.json();
    const { sourceId, targetId, type, marriageYear, divorceYear, adoptionYear, bondYear } = body;

    // Validate input
    if (!sourceId || !targetId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Run validation (same as frontend)
    const validation = validateNewRelationship(tree, {
      sourceId,
      targetId,
      type,
      marriageYear,
      divorceYear,
      adoptionYear,
      bondYear,
    });

    if (!validation.valid) {
      // Return validation errors without creating edge
      return NextResponse.json(
        {
          result: null,
          validation,
        },
        { status: 201 } // 201 to indicate attempted creation (but validation failed)
      );
    }

    // Create edge
    const edge = await prisma.familyEdge.create({
      data: {
        treeId: params.treeId,
        sourceId,
        targetId,
        type,
        marriageYear: marriageYear ?? null,
        divorceYear: divorceYear ?? null,
        adoptionYear: adoptionYear ?? null,
        bondYear: bondYear ?? null,
      },
    });

    return NextResponse.json(
      {
        result: edge,
        validation: { valid: true, errors: [] },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating edge:', error);
    return NextResponse.json({ error: 'Failed to create edge' }, { status: 500 });
  }
}

// app/api/trees/[treeId]/edges/[edgeId]/route.ts
export async function PATCH(
  req: NextRequest,
  { params }: { params: { treeId: string; edgeId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify tree ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
    });
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    // Verify edge belongs to tree
    const edge = await prisma.familyEdge.findFirst({
      where: { id: params.edgeId, treeId: params.treeId },
    });
    if (!edge) return NextResponse.json({ error: 'Edge not found' }, { status: 404 });

    const body = await req.json();
    const updated = await prisma.familyEdge.update({
      where: { id: params.edgeId },
      data: {
        ...(body.type && { type: body.type }),
        ...(body.marriageYear !== undefined && { marriageYear: body.marriageYear }),
        ...(body.divorceYear !== undefined && { divorceYear: body.divorceYear }),
        ...(body.adoptionYear !== undefined && { adoptionYear: body.adoptionYear }),
        ...(body.bondYear !== undefined && { bondYear: body.bondYear }),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update edge' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { treeId: string; edgeId: string } }
) {
  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify tree ownership
    const tree = await prisma.familyTree.findFirst({
      where: { id: params.treeId, ownerId: parseInt(userId) },
    });
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    await prisma.familyEdge.delete({ where: { id: params.edgeId } });
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete edge' }, { status: 500 });
  }
}

// ============================================================
// Helper: Response Transformer
// ============================================================

// lib/api-helpers.ts
export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeCaseKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelCaseKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}
