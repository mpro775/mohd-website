import { RevisionsList } from "@/features/blog-admin/revisions/RevisionsList";

export default async function PostRevisionsPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <RevisionsList postId={id} />; }
