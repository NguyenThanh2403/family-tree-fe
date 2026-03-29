'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus, GitBranch, Trash2 } from 'lucide-react';
import { useTreeStore } from '@/core/store/tree.store';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Confirm } from '@/components/ui/Confirm';
import { Alert } from '@/components/ui/Alert';

export function TreeListClient({ autoCreate = false }: { autoCreate?: boolean }) {
  const t = useTranslations('tree');
  const tc = useTranslations('common');

  const trees = useTreeStore((s) => s.trees);
  const isLoading = useTreeStore((s) => s.isLoading);
  const error = useTreeStore((s) => s.error);
  const fetchTrees = useTreeStore((s) => s.fetchTrees);
  const createTree = useTreeStore((s) => s.createTree);
  const deleteTree = useTreeStore((s) => s.deleteTree);
  const clearError = useTreeStore((s) => s.clearError);

  const [createOpen, setCreateOpen] = useState(autoCreate);
  const [treeName, setTreeName] = useState('');
  const [treeDesc, setTreeDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchTrees(); }, [fetchTrees]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!treeName.trim()) return;
    setCreating(true);
    try {
      const tree = await createTree(treeName.trim(), treeDesc.trim() || undefined);
      setCreateOpen(false);
      setTreeName('');
      setTreeDesc('');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteTree(deletingId);
      setDeletingId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  const deletingTree = trees.find((t) => t.id === deletingId);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" dismissible onDismiss={clearError}>{error}</Alert>
      )}

      <div className="flex justify-end">
        <Button leftIcon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
          {t('createTree')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : trees.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-neutral-400 gap-3">
          <GitBranch size={40} />
          <p>{t('noTrees')}</p>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {trees.map((tree) => (
            <li
              key={tree.id}
              className="flex items-center justify-between gap-4
                         bg-white rounded-xl border border-neutral-200 px-4 py-3
                         hover:shadow-sm transition-shadow"
            >
              <Link
                href={`/tree/${tree.id}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <GitBranch size={20} className="text-green-600 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{tree.name}</p>
                  {tree.description && (
                    <p className="text-xs text-neutral-400 truncate">{tree.description}</p>
                  )}
                </div>
                <span className="text-xs text-neutral-400 shrink-0 ml-auto">
                  {tree.members.length} member{tree.members.length !== 1 ? 's' : ''}
                </span>
              </Link>
              <button
                onClick={() => setDeletingId(tree.id)}
                aria-label={`Delete ${tree.name}`}
                className="shrink-0 p-1.5 rounded-md text-neutral-400
                           hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('createTree')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button form="create-tree-form" type="submit" loading={creating}>
              {tc('save')}
            </Button>
          </>
        }
      >
        <form id="create-tree-form" onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t('treeName')}
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            required
          />
          <Input
            label={t('treeDescription')}
            value={treeDesc}
            onChange={(e) => setTreeDesc(e.target.value)}
          />
        </form>
      </Modal>

      {/* Delete confirm */}
      <Confirm
        open={!!deletingId}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        title={`Delete "${deletingTree?.name}"?`}
        description="This will permanently delete the tree and all its members."
        variant="danger"
        confirmLabel={tc('delete')}
        loading={deleteLoading}
      />
    </div>
  );
}
