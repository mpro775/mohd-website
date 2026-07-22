"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X, GripVertical } from "lucide-react";
import { adminClient } from "@/lib/api/admin-client";

export interface PostOption {
  id: string;
  title: string;
  slug: string;
  status: string;
  featuredImage: string | null;
  publishedAt: string | null;
}

export function AsyncPostMultiSelect({
  value,
  onChange,
  excludePostId,
  maxItems = 6,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  excludePostId?: string;
  maxItems?: number;
}) {
  const [selectedPosts, setSelectedPosts] = useState<PostOption[]>([]);
  const [options, setOptions] = useState<PostOption[]>([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const initialized = useRef(false);

  // Fetch initial selected posts
  useEffect(() => {
    if (initialized.current) return;
    if (value.length > 0) {
      adminClient
        .customRequest<{ items: PostOption[] }>("blog/posts/options", "GET", undefined, { ids: value.join(","), limit: 100 })
        .then((res) => {
          // preserve order from value
          const fetchedMap = new Map(res.data.items.map((p) => [p.id, p]));
          const ordered = value.map((id) => fetchedMap.get(id)).filter(Boolean) as PostOption[];
          setSelectedPosts(ordered);
          initialized.current = true;
        })
        .catch(() => undefined);
    } else {
      initialized.current = true;
    }
  }, [value]);

  // Sync selectedPosts -> value
  useEffect(() => {
    if (!initialized.current) return;
    const currentIds = selectedPosts.map((p) => p.id);
    if (currentIds.join(",") !== value.join(",")) {
      onChange(currentIds);
    }
  }, [selectedPosts, value, onChange]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setIsSearching(true);
      adminClient
        .customRequest<{ items: PostOption[] }>("blog/posts/options", "GET", undefined, {
          search: search || undefined,
          excludeId: excludePostId,
          limit: 10,
        })
        .then((res) => setOptions(res.data.items))
        .finally(() => setIsSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, isOpen, excludePostId]);

  const removePost = (id: string) => {
    setSelectedPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const addPost = (post: PostOption) => {
    if (selectedPosts.length >= maxItems) return;
    if (selectedPosts.some((p) => p.id === post.id)) return;
    setSelectedPosts((prev) => [...prev, post]);
    setSearch("");
    setIsOpen(false);
  };

  // Drag and Drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    // e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copy = [...selectedPosts];
      const item = copy.splice(dragItem.current, 1)[0];
      copy.splice(dragOverItem.current, 0, item);
      setSelectedPosts(copy);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      {selectedPosts.length < maxItems && (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              placeholder="ابحث عن مقال لإضافته..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          {isOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-xl">
              {isSearching ? (
                <div className="p-3 text-center text-xs text-muted-foreground">جاري البحث...</div>
              ) : options.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">لم يتم العثور على مقالات</div>
              ) : (
                options.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    disabled={selectedPosts.some((p) => p.id === post.id)}
                    onClick={() => addPost(post)}
                    className="flex w-full items-center gap-3 rounded p-2 text-right transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {post.featuredImage ? (
                      <img src={post.featuredImage} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{post.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{post.status}</span>
                        {post.status !== "published" && <span className="rounded bg-amber-500/10 px-1 text-[10px] text-amber-500">غير منشور</span>}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Items */}
      <div className="space-y-2">
        {selectedPosts.map((post, index) => (
          <div
            key={post.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 shadow-sm cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            {post.featuredImage ? (
              <img src={post.featuredImage} alt="" className="h-8 w-8 rounded object-cover" />
            ) : (
              <div className="h-8 w-8 rounded bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{post.title}</div>
            </div>
            <button
              type="button"
              onClick={() => removePost(post.id)}
              className="rounded p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        تم اختيار {selectedPosts.length} من {maxItems}
      </div>
    </div>
  );
}
