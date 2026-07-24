import type { ReactNode } from "react";

export function BlogKeyboardKey({ children }: { children: ReactNode }) {
  return (
    <kbd className="blog-keyboard-key" dir="auto">
      {children}
    </kbd>
  );
}

