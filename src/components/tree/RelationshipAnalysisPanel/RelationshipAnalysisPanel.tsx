'use client';

import { X, ArrowRight, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useLanguage } from '@/hooks/useLanguage';
import type { RelationshipAnalysis } from '@/types/relationship.types';
import type { FamilyMember } from '@/types/tree.types';
import { Alert } from '@/components/ui/Alert';

interface RelationshipAnalysisPanelProps {
  nodeA: FamilyMember;
  nodeB: FamilyMember;
  analysis: RelationshipAnalysis | null;
  loading?: boolean;
  onClose: () => void;
}

export function RelationshipAnalysisPanel({
  nodeA,
  nodeB,
  analysis,
  loading = false,
  onClose,
}: RelationshipAnalysisPanelProps) {
  const t = useTranslations('tree.analysis');
  const commonT = useTranslations('common');
  const { language } = useLanguage();

  return (
    <aside
      role="complementary"
      aria-label="Relationship analysis"
      className={cn(
        'absolute bottom-4 right-4 z-20',
        'w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-[#db2777]/10',
        'p-4 space-y-3 backdrop-blur-sm',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Users size={16} className="text-[#4ade80]" aria-hidden />
          {t('title')}
        </div>
        <button
          onClick={onClose}
          aria-label={commonT('close')}
          className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]"
        >
          <X size={16} />
        </button>
      </div>

      {/* Node A → Node B */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)] truncate max-w-[120px]">
          {nodeA.name}
        </span>
        <ArrowRight size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
        <span className="font-medium text-[var(--text-primary)] truncate max-w-[120px]">
          {nodeB.name}
        </span>
      </div>

      {loading && (
        <p className="text-sm text-[var(--text-muted)] text-center py-2">{t('selectTwo')}</p>
      )}

      {!loading && analysis && !analysis.found && (
        <Alert variant="info">{t('noPath')}</Alert>
      )}

      {!loading && analysis?.found && (
        <dl className="space-y-2 text-sm text-[var(--text-secondary)]">
          {/* Relationship label */}
          <div className="flex items-center justify-between">
            <dt className="text-[var(--text-muted)]">{t('relationship')}</dt>
            <dd className="font-semibold text-[#4ade80]">{analysis.relationshipLabel}</dd>
          </div>

          {/* A addresses B */}
          <div className="flex items-center justify-between">
            <dt className="text-[var(--text-muted)]">{nodeA.name} {t('addressFromA')}</dt>
            <dd className="font-medium text-[var(--text-primary)]">{analysis.addressFromA}</dd>
          </div>

          {/* B addresses A */}
          <div className="flex items-center justify-between">
            <dt className="text-[var(--text-muted)]">{nodeB.name} {t('addressFromB')}</dt>
            <dd className="font-medium text-[var(--text-primary)]">{analysis.addressFromB}</dd>
          </div>

          {/* Generation delta */}
          <div className="flex items-center justify-between">
            <dt className="text-[var(--text-muted)]">{t('generation')}:</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              {analysis.generationDelta > 0 ? `+${analysis.generationDelta}` : analysis.generationDelta}
            </dd>
          </div>

          {/* Description */}
          <div className="pt-1 border-t border-[var(--border)]">
            <p className="text-[var(--text-muted)] italic text-xs leading-relaxed">{analysis.description}</p>
          </div>

          {/* Path */}
          <div>
            <dt className="text-[var(--text-muted)] text-xs mb-1">{t('path')}:</dt>
            <dd>
              <div className="flex flex-wrap gap-1">
                {analysis.pathIds.map((id, idx) => (
                  <span
                    key={id}
                    className="text-xs bg-[#4ade80]/15 text-[#bbf7d0] px-2 py-0.5 rounded-full border border-[#4ade80]/30"
                  >
                    {idx === 0 ? nodeA.name : idx === analysis.pathIds.length - 1 ? nodeB.name : id.slice(0, 6)}
                  </span>
                ))}
              </div>
            </dd>
          </div>
        </dl>
      )}
    </aside>
  );
}
