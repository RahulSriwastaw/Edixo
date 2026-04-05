import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/proxy';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(req, `/blog/categories/${params.id}`);
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(req, `/blog/categories/${params.id}`);
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(req, `/blog/categories/${params.id}`);
}
