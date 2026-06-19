import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/proxy';

export async function POST(req: NextRequest) {
  return proxyToBackend(req, '/ai/blog-draft-from-url');
}
