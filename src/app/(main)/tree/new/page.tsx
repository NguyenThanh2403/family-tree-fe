import { redirect } from 'next/navigation';

/**
 * /tree/new redirects to the tree list page with ?create=1
 * so TreeListClient can auto-open the create modal.
 */
export default function NewTreePage() {
  redirect('/tree?create=1');
}
