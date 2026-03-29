import type { FamilyMember } from '@/types/tree.types';
import type { Locale } from '@/i18n';

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

function zhLabel(
  delta: number,
  genderB: FamilyMember['gender'],
  hasSpouseEdge: boolean,
): AddressLabels {
  const male = genderB === 'male';

  if (hasSpouseEdge && delta === 0) {
    return {
      relationshipLabel: male ? '丈夫 – 妻子' : '妻子 – 丈夫',
      addressFromA: male ? '丈夫' : '妻子',
      addressFromB: male ? '妻子' : '丈夫',
    };
  }

  switch (delta) {
    case 0:
      return {
        relationshipLabel: male ? '兄弟 – 姐妹' : '姐妹 – 兄弟',
        addressFromA: male ? '兄弟' : '姐妹',
        addressFromB: male ? '姐妹' : '兄弟',
      };
    case 1:
      return {
        relationshipLabel: male ? '母親 – 兒子' : '父親 – 女兒',
        addressFromA: male ? '兒子' : '女兒',
        addressFromB: male ? '母親' : '父親',
      };
    case -1:
      return {
        relationshipLabel: male ? '兒子 – 父親' : '女兒 – 母親',
        addressFromA: male ? '父親' : '母親',
        addressFromB: male ? '兒子' : '女兒',
      };
    case 2:
      return {
        relationshipLabel: male ? '祖父 – 孫子' : '祖母 – 孫女',
        addressFromA: male ? '孫子' : '孫女',
        addressFromB: male ? '祖母' : '祖父',
      };
    case -2:
      return {
        relationshipLabel: male ? '孫子 – 祖父' : '孫女 – 祖母',
        addressFromA: male ? '祖父' : '祖母',
        addressFromB: male ? '孫子' : '孫女',
      };
    case 3:
      return {
        relationshipLabel: '曾祖父 – 曾孫',
        addressFromA: '曾孫',
        addressFromB: '曾祖父',
      };
    case -3:
      return {
        relationshipLabel: '曾孫 – 曾祖父',
        addressFromA: '曾祖父',
        addressFromB: '曾孫',
      };
    default: {
      const gen = Math.abs(delta);
      return {
        relationshipLabel: `相隔 ${gen} 代`,
        addressFromA: delta > 0 ? '後裔' : '祖先',
        addressFromB: delta > 0 ? '祖先' : '後裔',
      };
    }
  }
}

function koLabel(
  delta: number,
  genderB: FamilyMember['gender'],
  hasSpouseEdge: boolean,
): AddressLabels {
  const male = genderB === 'male';

  if (hasSpouseEdge && delta === 0) {
    return {
      relationshipLabel: male ? '남편 – 아내' : '아내 – 남편',
      addressFromA: male ? '남편' : '아내',
      addressFromB: male ? '아내' : '남편',
    };
  }

  switch (delta) {
    case 0:
      return {
        relationshipLabel: male ? '형제 – 자매' : '자매 – 형제',
        addressFromA: male ? '형제' : '자매',
        addressFromB: male ? '자매' : '형제',
      };
    case 1:
      return {
        relationshipLabel: male ? '어머니 – 아들' : '아버지 – 딸',
        addressFromA: male ? '아들' : '딸',
        addressFromB: male ? '어머니' : '아버지',
      };
    case -1:
      return {
        relationshipLabel: male ? '아들 – 아버지' : '딸 – 어머니',
        addressFromA: male ? '아버지' : '어머니',
        addressFromB: male ? '아들' : '딸',
      };
    case 2:
      return {
        relationshipLabel: male ? '조부 – 손자' : '조모 – 손녀',
        addressFromA: male ? '손자' : '손녀',
        addressFromB: male ? '조모' : '조부',
      };
    case -2:
      return {
        relationshipLabel: male ? '손자 – 조부' : '손녀 – 조모',
        addressFromA: male ? '조부' : '조모',
        addressFromB: male ? '손자' : '손녀',
      };
    case 3:
      return {
        relationshipLabel: '증조부 – 증손',
        addressFromA: '증손',
        addressFromB: '증조부',
      };
    case -3:
      return {
        relationshipLabel: '증손 – 증조부',
        addressFromA: '증조부',
        addressFromB: '증손',
      };
    default: {
      const gen = Math.abs(delta);
      return {
        relationshipLabel: `${gen}대 차이`,
        addressFromA: delta > 0 ? '후손' : '조상',
        addressFromB: delta > 0 ? '조상' : '후손',
      };
    }
  }
}

function jaLabel(
  delta: number,
  genderB: FamilyMember['gender'],
  hasSpouseEdge: boolean,
): AddressLabels {
  const male = genderB === 'male';

  if (hasSpouseEdge && delta === 0) {
    return {
      relationshipLabel: male ? '夫 – 妻' : '妻 – 夫',
      addressFromA: male ? '夫' : '妻',
      addressFromB: male ? '妻' : '夫',
    };
  }

  switch (delta) {
    case 0:
      return {
        relationshipLabel: male ? '兄弟 – 姉妹' : '姉妹 – 兄弟',
        addressFromA: male ? '兄弟' : '姉妹',
        addressFromB: male ? '姉妹' : '兄弟',
      };
    case 1:
      return {
        relationshipLabel: male ? '母 – 息子' : '父 – 娘',
        addressFromA: male ? '息子' : '娘',
        addressFromB: male ? '母' : '父',
      };
    case -1:
      return {
        relationshipLabel: male ? '息子 – 父' : '娘 – 母',
        addressFromA: male ? '父' : '母',
        addressFromB: male ? '息子' : '娘',
      };
    case 2:
      return {
        relationshipLabel: male ? '祖父 – 孫' : '祖母 – 孫娘',
        addressFromA: male ? '孫' : '孫娘',
        addressFromB: male ? '祖母' : '祖父',
      };
    case -2:
      return {
        relationshipLabel: male ? '孫 – 祖父' : '孫娘 – 祖母',
        addressFromA: male ? '祖父' : '祖母',
        addressFromB: male ? '孫' : '孫娘',
      };
    case 3:
      return {
        relationshipLabel: '曽祖父 – 曽孫',
        addressFromA: '曾孫',
        addressFromB: '曽祖父',
      };
    case -3:
      return {
        relationshipLabel: '曾孫 – 曽祖父',
        addressFromA: '曽祖父',
        addressFromB: '曾孫',
      };
    default: {
      const gen = Math.abs(delta);
      return {
        relationshipLabel: `${gen} 世代の隔たり`,
        addressFromA: delta > 0 ? '子孫' : '先祖',
        addressFromB: delta > 0 ? '先祖' : '子孫',
      };
    }
  }
}

function thLabel(
  delta: number,
  genderB: FamilyMember['gender'],
  hasSpouseEdge: boolean,
): AddressLabels {
  const male = genderB === 'male';

  if (hasSpouseEdge && delta === 0) {
    return {
      relationshipLabel: male ? 'สามี – ภรรยา' : 'ภรรยา – สามี',
      addressFromA: male ? 'สามี' : 'ภรรยา',
      addressFromB: male ? 'ภรรยา' : 'สามี',
    };
  }

  switch (delta) {
    case 0:
      return {
        relationshipLabel: male ? 'พี่ชาย – พี่สาว' : 'พี่สาว – พี่ชาย',
        addressFromA: male ? 'พี่ชาย' : 'พี่สาว',
        addressFromB: male ? 'พี่สาว' : 'พี่ชาย',
      };
    case 1:
      return {
        relationshipLabel: male ? 'แม่ – ลูกชาย' : 'พ่อ – ลูกสาว',
        addressFromA: male ? 'ลูกชาย' : 'ลูกสาว',
        addressFromB: male ? 'แม่' : 'พ่อ',
      };
    case -1:
      return {
        relationshipLabel: male ? 'ลูกชาย – พ่อ' : 'ลูกสาว – แม่',
        addressFromA: male ? 'พ่อ' : 'แม่',
        addressFromB: male ? 'ลูกชาย' : 'ลูกสาว',
      };
    case 2:
      return {
        relationshipLabel: male ? 'ปู่ – หลานชาย' : 'ย่า/ยาย – หลานสาว',
        addressFromA: male ? 'หลานชาย' : 'หลานสาว',
        addressFromB: male ? 'ย่า/ยาย' : 'ปู่',
      };
    case -2:
      return {
        relationshipLabel: male ? 'หลานชาย – ปู่' : 'หลานสาว – ย่า/ยาย',
        addressFromA: male ? 'ปู่' : 'ย่า/ยาย',
        addressFromB: male ? 'หลานชาย' : 'หลานสาว',
      };
    case 3:
      return {
        relationshipLabel: 'ต้นตระกูล – เหลน',
        addressFromA: 'เหลน',
        addressFromB: 'ต้นตระกูล',
      };
    case -3:
      return {
        relationshipLabel: 'เหลน – ต้นตระกูล',
        addressFromA: 'ต้นตระกูล',
        addressFromB: 'เหลน',
      };
    default: {
      const gen = Math.abs(delta);
      return {
        relationshipLabel: `ห่างกัน ${gen} รุ่น`,
        addressFromA: delta > 0 ? 'ทายาท' : 'บรรพบุรุษ',
        addressFromB: delta > 0 ? 'บรรพบุรุษ' : 'ทายาท',
      };
    }
  }
}

export function resolveRelationshipLabel(
  _nodeA: FamilyMember,
  nodeB: FamilyMember,
  generationDelta: number,
  hasSpouseEdge: boolean,
  locale: Locale,
): AddressLabels {
  if (locale === 'vi') return viLabel(generationDelta, nodeB.gender, hasSpouseEdge);
  if (locale === 'en') return enLabel(generationDelta, nodeB.gender, hasSpouseEdge);
  if (locale === 'zh') return zhLabel(generationDelta, nodeB.gender, hasSpouseEdge);
  if (locale === 'ko') return koLabel(generationDelta, nodeB.gender, hasSpouseEdge);
  if (locale === 'ja') return jaLabel(generationDelta, nodeB.gender, hasSpouseEdge);
  if (locale === 'th') return thLabel(generationDelta, nodeB.gender, hasSpouseEdge);

  // fallback
  return enLabel(generationDelta, nodeB.gender, hasSpouseEdge);
}
