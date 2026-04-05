import { redirect } from 'next/navigation';

export default function SingleOwnerModeRedirectPage() {
  redirect('/whiteboard-accounts?notice=single-owner-mode');
}
