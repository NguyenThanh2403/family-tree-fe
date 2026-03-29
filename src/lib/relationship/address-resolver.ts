import type { FamilyMember } from '@/types/tree.types';

interface AddressLabels {
  relationshipLabel: string;  // e.g. "Ông – Cháu"
  addressFromA: string;       // How A addresses B
  addressFromB: string;       // How B addresses A
}

// ============================================================
// Vietnamese kinship address table
// delta = generationDelta (B relative to A; positive = B is younger)
// ============================================================

function viLabel(
  delta: number,
  genderB: FamilyMember['gender'],
  hasSpouseEdge: boolean,
): AddressLabels {
  const male = genderB === 'male';
  const female = genderB === 'female';

  if (hasSpouseEdge && delta === 0) {
    // In-law or spouse relationship on same generation
    return {
      relationshipLabel: male ? 'Vợ – Chồng' : 'Chồng – Vợ',
      addressFromA: male ? 'Anh' : 'Em',
      addressFromB: male ? 'Em' : 'Anh',
    };
  }

  switch (delta) {
    case 0:
      return {
        relationshipLabel: male ? 'Chị/Em gái – Anh' : 'Anh – Chị/Em gái',
        addressFromA: male ? 'Anh/Em trai' : 'Chị/Em gái',
        addressFromB: male ? 'Em/Chị gái' : 'Anh/Em trai',
      };
    case 1:
      return {
        relationshipLabel: male ? 'Mẹ – Con trai' : 'Bố – Con gái',
        addressFromA: male ? 'Con trai' : 'Con gái',
        addressFromB: male ? 'Mẹ' : 'Bố',
      };
    case -1:
      return {
        relationshipLabel: male ? 'Con trai – Bố' : 'Con gái – Mẹ',
        addressFromA: male ? 'Bố' : 'Mẹ',
        addressFromB: male ? 'Con trai' : 'Con gái',
      };
    case 2:
      return {
        relationshipLabel: male ? 'Ông – Cháu trai' : 'Bà – Cháu gái',
        addressFromA: 'Cháu',
        addressFromB: male ? 'Bà' : 'Ông',
      };
    case -2:
      return {
        relationshipLabel: male ? 'Cháu trai – Ông' : 'Cháu gái – Bà',
        addressFromA: male ? 'Ông' : 'Bà',
        addressFromB: 'Cháu',
      };
    case 3:
      return {
        relationshipLabel: 'Cụ – Chắt',
        addressFromA: 'Chắt',
        addressFromB: 'Cụ',
      };
    case -3:
      return {
        relationshipLabel: 'Chắt – Cụ',
        addressFromA: 'Cụ',
        addressFromB: 'Chắt',
      };
    default: {
      const gen = Math.abs(delta);
      return {
        relationshipLabel: `Thế hệ cách ${gen}`,
        addressFromA: delta > 0 ? 'Con cháu' : 'Tổ tiên',
        addressFromB: delta > 0 ? 'Tổ tiên' : 'Con cháu',
      };
    }
  }
}

// ============================================================
// English kinship address table
// ============================================================

function enLabel(
  delta: number,
  genderB: FamilyMember['gender'],
  hasSpouseEdge: boolean,
): AddressLabels {
  const male = genderB === 'male';

  if (hasSpouseEdge && delta === 0) {
    return {
      relationshipLabel: male ? 'Husband – Wife' : 'Wife – Husband',
      addressFromA: male ? 'Husband' : 'Wife',
      addressFromB: male ? 'Wife' : 'Husband',
    };
  }

  switch (delta) {
    case 0:
      return {
        relationshipLabel: male ? 'Sister – Brother' : 'Brother – Sister',
        addressFromA: male ? 'Brother' : 'Sister',
        addressFromB: male ? 'Sister' : 'Brother',
      };
    case 1:
      return {
        relationshipLabel: male ? 'Mother – Son' : 'Father – Daughter',
        addressFromA: male ? 'Son' : 'Daughter',
        addressFromB: male ? 'Mother' : 'Father',
      };
    case -1:
      return {
        relationshipLabel: male ? 'Son – Father' : 'Daughter – Mother',
        addressFromA: male ? 'Father' : 'Mother',
        addressFromB: male ? 'Son' : 'Daughter',
      };
    case 2:
      return {
        relationshipLabel: male ? 'Grandfather – Grandson' : 'Grandmother – Granddaughter',
        addressFromA: male ? 'Grandson' : 'Granddaughter',
        addressFromB: male ? 'Grandmother' : 'Grandfather',
      };
    case -2:
      return {
        relationshipLabel: male ? 'Grandson – Grandfather' : 'Granddaughter – Grandmother',
        addressFromA: male ? 'Grandfather' : 'Grandmother',
        addressFromB: male ? 'Grandson' : 'Granddaughter',
      };
    case 3:
      return {
        relationshipLabel: 'Great-grandparent – Great-grandchild',
        addressFromA: 'Great-grandchild',
        addressFromB: 'Great-grandparent',
      };
    case -3:
      return {
        relationshipLabel: 'Great-grandchild – Great-grandparent',
        addressFromA: 'Great-grandparent',
        addressFromB: 'Great-grandchild',
      };
    default: {
      const gen = Math.abs(delta);
      return {
        relationshipLabel: `${gen} generation${gen > 1 ? 's' : ''} apart`,
        addressFromA: delta > 0 ? 'Descendant' : 'Ancestor',
        addressFromB: delta > 0 ? 'Ancestor' : 'Descendant',
      };
    }
  }
}

// ============================================================
// Public resolver
// ============================================================

export function resolveRelationshipLabel(
  _nodeA: FamilyMember,
  nodeB: FamilyMember,
  generationDelta: number,
  hasSpouseEdge: boolean,
  locale: 'en' | 'vi',
): AddressLabels {
  return locale === 'vi'
    ? viLabel(generationDelta, nodeB.gender, hasSpouseEdge)
    : enLabel(generationDelta, nodeB.gender, hasSpouseEdge);
}
