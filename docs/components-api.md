# Component API Reference

## Design Principles

- Props follow TypeScript strict types
- All interactive components support `disabled`, `aria-*`
- Variants via explicit variant props (not boolean flags)
- Composition via `children` (not renderProps)
- `className` prop always accepted for extension

---

## `Button`

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;          // default: 'primary'
  size?: ButtonSize;                // default: 'md'
  loading?: boolean;                // shows spinner, disables click
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Button variant="primary" size="md" onClick={handleSubmit}>
  Submit
</Button>
<Button variant="danger" loading={isDeleting}>
  Delete
</Button>
```

---

## `Input`

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}
```

---

## `Select`

```tsx
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}
```

---

## `Modal`

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;    // default: true
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

Uses `<dialog>` element with focus trap. Accessible via ESC key.

---

## `Alert`

```tsx
type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;           // default: 'info'
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
```

---

## `Confirm`

```tsx
interface ConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;            // default: 'Confirm'
  cancelLabel?: string;             // default: 'Cancel'
  variant?: 'default' | 'danger';  // affects confirm button color
  loading?: boolean;
}
```

---

## `Table`

```tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}
```

---

## `NodeChip`

Represents a person node in the family tree.

```tsx
type Gender = 'male' | 'female' | 'unknown';

interface NodeChipProps {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;               // undefined = alive
  avatarUrl?: string;
  isRoot?: boolean;                 // highlight as tree root
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}
```

---

## `FamilyTreeCanvas`

Main interactive canvas component.

```tsx
interface FamilyTreeCanvasProps {
  treeId: string;
  nodes: FamilyNode[];
  edges: FamilyEdge[];
  selectedNodeIds?: string[];
  onNodeSelect?: (ids: string[]) => void;
  onNodeAdd?: (parentId: string, relationship: RelationshipType) => void;
  onNodeEdit?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onEdgeConnect?: (sourceId: string, targetId: string) => void;
  onLayoutChange?: (nodes: FamilyNode[]) => void;
  readOnly?: boolean;
  className?: string;
}
```

### Events Flow

```
User action → Canvas event → Parent handler → Store update → Re-render
```

---

## `NodeForm` (Modal form)

```tsx
interface NodeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NodeFormData) => Promise<void>;
  initialData?: Partial<NodeFormData>;
  relatedNodeId?: string;           // Pre-fills relationship context
  defaultRelationship?: RelationshipType;
  mode: 'create' | 'edit';
}

interface NodeFormData {
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  birthPlace?: string;
  note?: string;
  avatarUrl?: string;
  relationship?: RelationshipType;
}
```

---

## `RelationshipBadge`

```tsx
interface RelationshipBadgeProps {
  relationship: RelationshipType;
  locale?: 'en' | 'vi';
  className?: string;
}
```

Maps `RelationshipType` to colored badge with label.

---

## `RelationshipAnalysisPanel`

Shown when 2 nodes are selected simultaneously.

```tsx
interface RelationshipAnalysisPanelProps {
  nodeA: FamilyNode;
  nodeB: FamilyNode;
  analysis: RelationshipAnalysis | null;
  loading?: boolean;
  onClose: () => void;
}
```

Output:
```ts
interface RelationshipAnalysis {
  relationshipLabel: string;        // e.g. "Ông - Cháu"
  addressFromA: string;             // A calls B: "Cháu"
  addressFromB: string;             // B calls A: "Ông"
  generationDelta: number;          // +2 = A is 2 gen above B
  description: string;             // Human-readable
  pathIds: string[];                // Node IDs in path A → B
  found: boolean;
}
```
