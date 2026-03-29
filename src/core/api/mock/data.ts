import type { FamilyTree, FamilyMember, FamilyEdge } from '@/types/tree.types';
import type { User } from '@/types/auth.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 1000;
export function nextId() {
  return `mock-${++_idCounter}`;
}

export const now = () => new Date().toISOString();

// ── Seed user ─────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  userId: 1,
  username: 'demo',
  email: 'demo@familytree.com',
  firstName: 'Nguyễn Văn',
  lastName: 'An',
  displayName: 'Nguyễn Văn An',
  locale: 'vi',
};

// ── Seed tree 1 members ───────────────────────────────────────────────────────

const m1: FamilyMember = {
  id: 'mb-01',
  name: 'Nguyễn Văn Tổ',
  gender: 'male',
  birthYear: 1920,
  deathYear: 1995,
  birthPlace: 'Hà Nội',
  note: 'Ông nội / Tổ tiên đời đầu',
  createdAt: now(),
  updatedAt: now(),
};
const m2: FamilyMember = {
  id: 'mb-02',
  name: 'Trần Thị Bà',
  gender: 'female',
  birthYear: 1924,
  deathYear: 2002,
  birthPlace: 'Nam Định',
  note: 'Bà nội',
  createdAt: now(),
  updatedAt: now(),
};
const m3: FamilyMember = {
  id: 'mb-03',
  name: 'Nguyễn Văn Cha',
  gender: 'male',
  birthYear: 1950,
  birthPlace: 'Hà Nội',
  createdAt: now(),
  updatedAt: now(),
};
const m4: FamilyMember = {
  id: 'mb-04',
  name: 'Lê Thị Mẹ',
  gender: 'female',
  birthYear: 1955,
  birthPlace: 'Hải Phòng',
  createdAt: now(),
  updatedAt: now(),
};
const m5: FamilyMember = {
  id: 'mb-05',
  name: 'Nguyễn Văn An',
  gender: 'male',
  birthYear: 1980,
  birthPlace: 'Hà Nội',
  note: 'Người dùng hiện tại',
  createdAt: now(),
  updatedAt: now(),
};
const m6: FamilyMember = {
  id: 'mb-06',
  name: 'Nguyễn Thị Bình',
  gender: 'female',
  birthYear: 1983,
  birthPlace: 'Hà Nội',
  createdAt: now(),
  updatedAt: now(),
};
const m7: FamilyMember = {
  id: 'mb-07',
  name: 'Nguyễn Thị Cô',
  gender: 'female',
  birthYear: 1952,
  birthPlace: 'Hà Nội',
  createdAt: now(),
  updatedAt: now(),
};
const m8: FamilyMember = {
  id: 'mb-08',
  name: 'Trần Văn Chú',
  gender: 'male',
  birthYear: 1975,
  birthPlace: 'TP Hồ Chí Minh',
  createdAt: now(),
  updatedAt: now(),
};
const m9: FamilyMember = {
  id: 'mb-09',
  name: 'Nguyễn Văn Con',
  gender: 'male',
  birthYear: 2008,
  birthPlace: 'Hà Nội',
  createdAt: now(),
  updatedAt: now(),
};

// ── Seed tree 1 edges ─────────────────────────────────────────────────────────

const edges1: FamilyEdge[] = [
  { id: 'e-01', source: 'mb-01', target: 'mb-02', type: 'spouse', marriageYear: 1945 },
  { id: 'e-02', source: 'mb-01', target: 'mb-03', type: 'parent-child' },
  { id: 'e-03', source: 'mb-02', target: 'mb-03', type: 'parent-child' },
  { id: 'e-04', source: 'mb-01', target: 'mb-07', type: 'parent-child' },
  { id: 'e-05', source: 'mb-02', target: 'mb-07', type: 'parent-child' },
  { id: 'e-06', source: 'mb-03', target: 'mb-04', type: 'spouse', marriageYear: 1978 },
  { id: 'e-07', source: 'mb-03', target: 'mb-05', type: 'parent-child' },
  { id: 'e-08', source: 'mb-04', target: 'mb-05', type: 'parent-child' },
  { id: 'e-09', source: 'mb-03', target: 'mb-06', type: 'parent-child' },
  { id: 'e-10', source: 'mb-04', target: 'mb-06', type: 'parent-child' },
  { id: 'e-11', source: 'mb-07', target: 'mb-08', type: 'spouse', marriageYear: 2000 },
  { id: 'e-12', source: 'mb-05', target: 'mb-09', type: 'parent-child' },
];

// ── Seed tree 1 ───────────────────────────────────────────────────────────────

export const seedTree1: FamilyTree = {
  id: 'tree-01',
  name: 'Gia phả nhà Nguyễn',
  description: 'Cây gia phả của dòng họ Nguyễn từ năm 1920',
  ownerId: '1',
  members: [m1, m2, m3, m4, m5, m6, m7, m8, m9],
  edges: edges1,
  createdAt: now(),
  updatedAt: now(),
};

// ── Seed tree 2 ───────────────────────────────────────────────────────────────

const t2m1: FamilyMember = {
  id: 'tb-01',
  name: 'Trần Văn Gốc',
  gender: 'male',
  birthYear: 1930,
  deathYear: 2010,
  birthPlace: 'Nam Định',
  createdAt: now(),
  updatedAt: now(),
};
const t2m2: FamilyMember = {
  id: 'tb-02',
  name: 'Ngô Thị Bà',
  gender: 'female',
  birthYear: 1935,
  birthPlace: 'Thái Bình',
  createdAt: now(),
  updatedAt: now(),
};
const t2m3: FamilyMember = {
  id: 'tb-03',
  name: 'Trần Thị Hoa',
  gender: 'female',
  birthYear: 1960,
  birthPlace: 'Nam Định',
  createdAt: now(),
  updatedAt: now(),
};

export const seedTree2: FamilyTree = {
  id: 'tree-02',
  name: 'Gia phả nhà Trần',
  description: 'Cây gia phả của dòng họ Trần',
  ownerId: '1',
  members: [t2m1, t2m2, t2m3],
  edges: [
    { id: 'te-01', source: 'tb-01', target: 'tb-02', type: 'spouse', marriageYear: 1958 },
    { id: 'te-02', source: 'tb-01', target: 'tb-03', type: 'parent-child' },
    { id: 'te-03', source: 'tb-02', target: 'tb-03', type: 'parent-child' },
  ],
  createdAt: now(),
  updatedAt: now(),
};
