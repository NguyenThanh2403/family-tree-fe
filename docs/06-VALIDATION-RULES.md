# Validation Rules & Error Codes

This document defines all validation rules enforced by the backend API. These rules should be mirrored on the frontend for immediate user feedback.

## Error Codes Reference

All validation errors use a standardized error object:
```json
{
  "code": "ERROR_CODE_HERE",
  "field": "fieldName" // optional, helps locate the problematic field
}
```

---

## Category 1: Edge (Relationship) Validation

### SELF_RELATION
**Condition**: `sourceId === targetId`  
**Message**: "A person cannot have a relationship with themselves"  
**Field**: targetId  
**Fix**: Select a different target member

```
Example:
❌ POST /edges { source: mb-01, target: mb-01, type: "spouse" }
✅ POST /edges { source: mb-01, target: mb-02, type: "spouse" }
```

---

### DUPLICATE_RELATION
**Condition**: An edge with (treeId, sourceId, targetId, type) already exists  
**Message**: "A relationship of this type already exists between these members"  
**Field**: targetId  
**Fix**: Delete the existing edge first, or update it instead

```
Example:
❌ POST /edges { source: mb-01, target: mb-02, type: "spouse" }  (already exists)
✅ PATCH /edges/{existingId} { divorceYear: 2020 }
```

---

### CYCLE_DETECTED
**Condition**: Adding source → target would create a cycle in parent-child ancestry  
**Applies to**: type = 'parent-child' OR 'adoptive-parent'  
**Message**: "Adding this relationship would create a cycle in ancestry"  
**Field**: targetId  
**Detection**: DFS from target upward; if reach source, cycle exists

```
Example (Cycle):
  mb-01 → mb-02 (parent-child)
  mb-02 → mb-03 (parent-child)
  
❌ POST /edges { source: mb-03, target: mb-01, type: "parent-child" }  (cycle: 01→02→03→01)
✅ POST /edges { source: mb-03, target: mb-02, type: "parent-child" }   (no cycle)
```

---

### MAX_PARENTS_EXCEEDED
**Condition**: target already has ≥ 2 edges where type = 'parent-child' AND adding another 'parent-child'  
**Applies to**: type = 'parent-child' only  
**Message**: "A person can have at most 2 biological parents"  
**Field**: targetId  
**Note**: adoptive-parent edges have NO limit

```
Example:
  mb-03 has 2 parent-child edges (father + mother)
  
❌ POST /edges { source: mb-newperson, target: mb-03, type: "parent-child" }  (exceeds limit)
✅ POST /edges { source: mb-newperson, target: mb-03, type: "adoptive-parent" }  (OK)
```

---

### SPOUSE_TIME_OVERLAP
**Condition**: New marriage period overlaps with existing spouse period  
**Applies to**: type = 'spouse'  
**Message**: "This person already has an active marriage during this period"  
**Field**: targetId  
**Logic**:
- Existing period: [existingMarriageYear, existingDivorceYear or Infinity]
- New period: [newMarriageYear, newDivorceYear or Infinity]
- Overlap if: newStart < existEnd AND existStart < newEnd

```
Example:
  Existing spouse edge: marriage 2000, divorce 2010
  
❌ POST /edges { sourceId: mb-01, targetId: mb-new, type: "spouse", marriageYear: 2009, divorceYear: 2015 }  (2009 < 2010 AND 2000 < 2015 → overlap)
✅ POST /edges { sourceId: mb-01, targetId: mb-new, type: "spouse", marriageYear: 2011 }  (2011 >= 2010 → no overlap)
```

---

### AGE_INCONSISTENCY
**Condition**: Parent and child birth years are inconsistent  
**Applies to**: type = 'parent-child' OR 'adoptive-parent'  
**Rule**: parent.birthYear + MIN_PARENT_AGE_DIFF ≤ child.birthYear  
**MIN_PARENT_AGE_DIFF**: 13 (years)  
**Message**: "Parent must be at least 13 years older than child"  
**Field**: targetId

```
Example:
  Father born 1980, child born 1970
  
❌ NOT OK (1970 + 13 > 1980)
✅ Father born 1970, child born 1990 (OK: 1970 + 13 ≤ 1990)
```

---

## Category 2: Adoption Year Validation

### INVALID_ADOPTION_YEAR
**Condition**: adoptionYear is provided but outside valid range  
**Applies to**: type = 'adoptive-parent' when adoptionYear is set  
**Range**: 1800 ≤ adoptionYear ≤ currentYear + 1  
**Message**: "Adoption year must be between 1800 and {currentYear + 1}"  
**Field**: adoptionYear

```
Example (Current year = 2026):
❌ adoptionYear: 1799  (< 1800)
❌ adoptionYear: 2027  (> 2026)
✅ adoptionYear: 1950  (OK)
✅ adoptionYear: 2026  (OK)
```

---

## Category 3: Marriage Year Validation

### INVALID_MARRIAGE_YEAR
**Condition**: marriageYear is provided but outside valid range  
**Applies to**: type = 'spouse' when marriageYear is set  
**Range**: 1800 ≤ marriageYear ≤ currentYear + 1  
**Message**: "Marriage year must be between 1800 and {currentYear + 1}"  
**Field**: marriageYear

```
Example:
❌ marriageYear: 1799  (< 1800)
❌ divorceYear: 2027  (> 2027)
✅ marriageYear: 1978, divorceYear: 2005  (OK)
```

---

### INVALID_DIVORCE_YEAR
**Condition**: divorceYear < marriageYear (divorce before marriage)  
**Applies to**: type = 'spouse'  
**Message**: "Divorce year must be after marriage year"  
**Field**: divorceYear

```
Example:
  marriageYear: 2000
  
❌ divorceYear: 1999  (before marriage)
✅ divorceYear: 2010  (after marriage)
```

---

## Category 4: Member (Node) Validation

### NAME_TOO_SHORT
**Condition**: name.length < 1 or after trim is empty  
**Message**: "Name must be at least 1 character"  
**Field**: name

```
Example:
❌ name: ""
❌ name: "   " (whitespace only)
✅ name: "A" (OK)
✅ name: "Nguyễn Văn An"
```

---

### INVALID_BIRTH_YEAR
**Condition**: birthYear is outside valid range  
**Range**: 1000 ≤ birthYear ≤ currentYear  
**Message**: "Birth year must be between 1000 and {currentYear}"  
**Field**: birthYear

```
Example (Current year = 2026):
❌ birthYear: 999    (< 1000)
❌ birthYear: 2027   (> 2026)
✅ birthYear: 1980
```

---

### INVALID_DEATH_YEAR
**Condition**: deathYear is outside valid range OR deathYear ≤ birthYear  
**Range**: 1000 ≤ deathYear ≤ currentYear + 1  
**Logic**: If both provided, deathYear > birthYear  
**Message**: "Death year must be after birth year and not in the future"  
**Field**: deathYear

```
Example:
  birthYear: 1950, deathYear: 1940
  
❌ deathYear < birthYear  (death before birth)
❌ deathYear: 2027  (in the future)
✅ birthYear: 1950, deathYear: 2010
```

---

## Category 5: Gender Validation

### INVALID_GENDER
**Condition**: gender is not in enum  
**Valid values**: 'male' | 'female' | 'unknown'  
**Message**: "Gender must be 'male', 'female', or 'unknown'"  
**Field**: gender

```
Example:
❌ gender: "other"
✅ gender: "male"
✅ gender: "unknown"
```

---

## Implementation Checklist

### Backend (Server-side - MUST enforce)
- [ ] SELF_RELATION check before saving edge
- [ ] DUPLICATE_RELATION check (unique constraint + app logic)
- [ ] CYCLE_DETECTED check for parent-child/adoptive-parent edges
- [ ] MAX_PARENTS_EXCEEDED check for biological parents only
- [ ] SPOUSE_TIME_OVERLAP check for type='spouse'
- [ ] AGE_INCONSISTENCY check for parent-child/adoptive-parent
- [ ] INVALID_ADOPTION_YEAR range validation
- [ ] INVALID_MARRIAGE_YEAR & INVALID_DIVORCE_YEAR range validation
- [ ] NAME_TOO_SHORT check
- [ ] INVALID_BIRTH_YEAR range validation
- [ ] INVALID_DEATH_YEAR range & consistency validation
- [ ] INVALID_GENDER enum check

### Frontend (Client-side - for instant feedback)
- [ ] Same validators mirrored from backend (`tree.validation.ts` already has most)
- [ ] Display errors to user in form fields
- [ ] Disable "Save" button until all validation passes
- [ ] Show helpful messages guiding correction

### Database (Constraints - failsafe)
- [ ] NOT NULL on required fields (name, gender, source_id, target_id, type)
- [ ] CHECK constraints on year fields (1000–2100)
- [ ] CHECK self_relation (source_id ≠ target_id)
- [ ] CHECK divorce > marriage (if both present)
- [ ] CHECK death > birth (if both present)
- [ ] UNIQUE constraint on (tree_id, source_id, target_id, type) to prevent duplicates
- [ ] Cascading deletes when member or tree is deleted

---

## Constants

```
MIN_PARENT_AGE_DIFF = 13 (years)
CURRENT_YEAR = new Date().getFullYear()
VALID_YEAR_MIN = 1000
VALID_YEAR_MAX = CURRENT_YEAR + 1
MIN_NAME_LENGTH = 1
```

---

## API Contract: Validation Response Format

When validation fails on edge creation:

```json
{
  "result": null,
  "validation": {
    "valid": false,
    "errors": [
      { "code": "SPOUSE_TIME_OVERLAP", "field": "targetId" },
      { "code": "AGE_INCONSISTENCY", "field": "targetId" }
    ]
  }
}
```

The frontend should:
1. Check `validation.valid`
2. If false, display errors with friendly messages
3. Highlight related fields in the form
4. Allow user to correct and retry

---

## Testing Scenarios

### Happy Path
1. Create member ✅
2. Add parent-child edge with 2 distinct people ✅
3. Add spouse edge with marriage year ✅
4. Add adoptive-parent edge ✅
5. Update edge to add divorce year ✅
6. Delete edge ✅

### Edge Cases (Should Fail)
1. Add self-relation (source = target) ❌ SELF_RELATION
2. Add duplicate edge ❌ DUPLICATE_RELATION
3. Add edge creating cycle ❌ CYCLE_DETECTED
4. Add 3rd bio parent ❌ MAX_PARENTS_EXCEEDED
5. Add overlapping spouse ❌ SPOUSE_TIME_OVERLAP
6. Add child younger than parent by < 13 years ❌ AGE_INCONSISTENCY
7. Create member without name ❌ NAME_TOO_SHORT
8. Set birth year = 999 ❌ INVALID_BIRTH_YEAR
9. Set death < birth ❌ INVALID_DEATH_YEAR
10. Set divorce < marriage ❌ INVALID_DIVORCE_YEAR
