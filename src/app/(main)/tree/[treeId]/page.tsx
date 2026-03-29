import type { Metadata } from 'next';
import { TreeViewerClient } from './TreeViewerClient';

interface Props {
  params: Promise<{ treeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treeId } = await params;
  return { title: `Tree ${treeId}` };
}

export default async function TreeViewerPage({ params }: Props) {
  const { treeId } = await params;
  return <TreeViewerClient treeId={treeId} />;
}
