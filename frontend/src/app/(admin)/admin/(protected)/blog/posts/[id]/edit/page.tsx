import { PostEditorPage } from "@/features/blog-admin/post-form/PostEditorPage";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <PostEditorPage postId={id} />; }
