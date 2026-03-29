# API Request/Response Examples

## Trees

### 1. Create Tree
**POST** `/api/trees`

#### Request
```json
{
  "name": "Gia phả nhà Nguyễn",
  "description": "Cây gia phả của dòng họ Nguyễn từ năm 1920"
}
```

#### Response (201 Created)
```json
{
  "id": "tree-01",
  "name": "Gia phả nhà Nguyễn",
  "description": "Cây gia phả của dòng họ Nguyễn từ năm 1920",
  "ownerId": 1,
  "members": [],
  "edges": [],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

### 2. List Trees
**GET** `/api/trees?limit=50&offset=0`

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "tree-01",
      "name": "Gia phả nhà Nguyễn",
      "description": "Cây gia phả của dòng họ Nguyễn từ năm 1920",
      "ownerId": 1,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "tree-02",
      "name": "Gia phả nhà Trần",
      "ownerId": 1,
      "createdAt": "2025-01-16T10:00:00Z",
      "updatedAt": "2025-01-16T10:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 3. Get Full Tree
**GET** `/api/trees/tree-01`

#### Response (200 OK)
```json
{
  "id": "tree-01",
  "name": "Gia phả nhà Nguyễn",
  "description": "Cây gia phả của dòng họ Nguyễn từ năm 1920",
  "ownerId": 1,
  "members": [
    {
      "id": "mb-01",
      "treeId": "tree-01",
      "name": "Nguyễn Văn Tổ",
      "gender": "male",
      "birthYear": 1920,
      "deathYear": 1995,
      "birthPlace": "Hà Nội",
      "note": "Ông nội / Tổ tiên đời đầu",
      "avatarUrl": null,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "mb-03",
      "treeId": "tree-01",
      "name": "Nguyễn Văn Cha",
      "gender": "male",
      "birthYear": 1950,
      "deathYear": null,
      "birthPlace": "Hà Nội",
      "note": null,
      "avatarUrl": null,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "edges": [
    {
      "id": "e-02",
      "treeId": "tree-01",
      "sourceId": "mb-01",
      "targetId": "mb-03",
      "type": "parent-child",
      "marriageYear": null,
      "divorceYear": null,
      "adoptionYear": null,
      "bondYear": null,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

## Members

### 1. Create Member
**POST** `/api/trees/tree-01/members`

#### Request
```json
{
  "name": "Nguyễn Văn Tổ",
  "gender": "male",
  "birthYear": 1920,
  "deathYear": 1995,
  "birthPlace": "Hà Nội",
  "note": "Ông nội / Tổ tiên đời đầu"
}
```

#### Response (201 Created)
```json
{
  "id": "mb-01",
  "treeId": "tree-01",
  "name": "Nguyễn Văn Tổ",
  "gender": "male",
  "birthYear": 1920,
  "deathYear": 1995,
  "birthPlace": "Hà Nội",
  "note": "Ông nội / Tổ tiên đời đầu",
  "avatarUrl": null,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

### 2. Update Member
**PATCH** `/api/trees/tree-01/members/mb-01`

#### Request
```json
{
  "note": "Ông nội (updated)",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### Response (200 OK)
```json
{
  "id": "mb-01",
  "treeId": "tree-01",
  "name": "Nguyễn Văn Tổ",
  "gender": "male",
  "birthYear": 1920,
  "deathYear": 1995,
  "birthPlace": "Hà Nội",
  "note": "Ông nội (updated)",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:05:00Z"
}
```

---

## Relationships (Edges)

### 1. Add Parent-Child Relationship
**POST** `/api/trees/tree-01/edges`

#### Request
```json
{
  "sourceId": "mb-01",
  "targetId": "mb-03",
  "type": "parent-child"
}
```

#### Response (201 Created)
```json
{
  "result": {
    "id": "e-02",
    "treeId": "tree-01",
    "sourceId": "mb-01",
    "targetId": "mb-03",
    "type": "parent-child",
    "marriageYear": null,
    "divorceYear": null,
    "adoptionYear": null,
    "bondYear": null,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

### 2. Add Spouse Relationship (with years)
**POST** `/api/trees/tree-01/edges`

#### Request
```json
{
  "sourceId": "mb-03",
  "targetId": "mb-04",
  "type": "spouse",
  "marriageYear": 1978,
  "divorceYear": 2005
}
```

#### Response (201 Created)
```json
{
  "result": {
    "id": "e-06",
    "treeId": "tree-01",
    "sourceId": "mb-03",
    "targetId": "mb-04",
    "type": "spouse",
    "marriageYear": 1978,
    "divorceYear": 2005,
    "adoptionYear": null,
    "bondYear": null,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

### 3. Add Adoptive Parent Relationship
**POST** `/api/trees/tree-01/edges`

#### Request
```json
{
  "sourceId": "mb-uncle",
  "targetId": "mb-03",
  "type": "adoptive-parent",
  "adoptionYear": 2010
}
```

#### Response (201 Created)
```json
{
  "result": {
    "id": "e-100",
    "treeId": "tree-01",
    "sourceId": "mb-uncle",
    "targetId": "mb-03",
    "type": "adoptive-parent",
    "marriageYear": null,
    "divorceYear": null,
    "adoptionYear": 2010,
    "bondYear": null,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

### 4. Validation Error - Max Parents Exceeded
**POST** `/api/trees/tree-01/edges`

#### Request (trying to add 3rd biological parent)
```json
{
  "sourceId": "mb-grandma2",
  "targetId": "mb-03",
  "type": "parent-child"
}
```

#### Response (201 Created - but validation fails)
```json
{
  "result": null,
  "validation": {
    "valid": false,
    "errors": [
      {
        "code": "MAX_PARENTS_EXCEEDED",
        "field": "targetId"
      }
    ]
  }
}
```

---

### 5. Validation Error - Spouse Time Overlap
**POST** `/api/trees/tree-01/edges`

#### Request (trying to add overlapping marriage)
```json
{
  "sourceId": "mb-05",
  "targetId": "mb-person2",
  "type": "spouse",
  "marriageYear": 2005,
  "divorceYear": 2010
}
```

#### Response (if person already married 2003–2012)
```json
{
  "result": null,
  "validation": {
    "valid": false,
    "errors": [
      {
        "code": "SPOUSE_TIME_OVERLAP",
        "field": "targetId"
      }
    ]
  }
}
```

---

### 6. Update Edge (Change Divorce Year)
**PATCH** `/api/trees/tree-01/edges/e-06`

#### Request
```json
{
  "divorceYear": 2008
}
```

#### Response (200 OK)
```json
{
  "id": "e-06",
  "treeId": "tree-01",
  "sourceId": "mb-03",
  "targetId": "mb-04",
  "type": "spouse",
  "marriageYear": 1978,
  "divorceYear": 2008,
  "adoptionYear": null,
  "bondYear": null,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:05:00Z"
}
```

---

### 7. Delete Edge
**DELETE** `/api/trees/tree-01/edges/e-06`

#### Response (204 No Content)
```
(empty)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "code": "INVALID_REQUEST",
  "message": "Missing required field: name",
  "details": {
    "field": "name"
  }
}
```

### 404 Not Found
```json
{
  "code": "NOT_FOUND",
  "message": "Tree with id 'tree-invalid' not found"
}
```

### 409 Conflict (Duplicate Edge)
```json
{
  "code": "DUPLICATE_RELATION",
  "message": "A relationship of type 'spouse' already exists between these members",
  "details": {
    "sourceId": "mb-03",
    "targetId": "mb-04",
    "type": "spouse"
  }
}
```

### 422 Unprocessable Entity (Cycle)
```json
{
  "code": "CYCLE_DETECTED",
  "message": "Adding this relationship would create a cycle in ancestry",
  "details": {
    "sourceId": "mb-05",
    "targetId": "mb-01"
  }
}
```

---

## Batch/Composite Operations (Recommended Patterns)

### Pattern: Create Member + Add Relationship in Transaction
While the API doesn't expose a true "batch" endpoint, the frontend should wrap two calls:

```javascript
// 1. Create new member
const newMember = await POST /api/trees/tree-01/members
  body: { name: "...", gender: "...", birthYear: ... }

// 2. Create edge
const newEdge = await POST /api/trees/tree-01/edges
  body: { sourceId: existingParent.id, targetId: newMember.id, type: "parent-child" }

// On any failure, rollback or inform user
```

---

## Query Patterns (Recommended Indices)

When querying the database for common use cases:

1. **Get all children of person X**: `WHERE type IN ('parent-child', 'adoptive-parent') AND source_id = X`
2. **Get all parents of person X**: `WHERE type IN ('parent-child', 'adoptive-parent') AND target_id = X`
3. **Get all spouses of person X**: `WHERE type = 'spouse' AND (source_id = X OR target_id = X)`
4. **Check for existing relationship**: `WHERE tree_id = ? AND source_id = ? AND target_id = ? AND type = ?`
5. **Find all active marriages**: `WHERE type = 'spouse' AND divorce_year IS NULL`
