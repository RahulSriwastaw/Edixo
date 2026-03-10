import { redirect } from 'next/navigation';

export default function FoldersRedirectPage() {
    redirect('/question-bank/questions');
}
