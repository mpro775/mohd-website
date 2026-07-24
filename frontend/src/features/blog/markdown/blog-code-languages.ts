export const BLOG_CODE_LANGUAGES = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  bash: "Bash",
  powershell: "PowerShell",
  dart: "Dart",
  php: "PHP",
  python: "Python",
  sql: "SQL",
  yaml: "YAML",
  dockerfile: "Dockerfile",
  html: "HTML",
  css: "CSS",
  mermaid: "Mermaid",
} as const;

export function blogCodeLanguageLabel(language?: string | null): string {
  if (!language) return "نص";
  return (
    BLOG_CODE_LANGUAGES[language as keyof typeof BLOG_CODE_LANGUAGES] ?? language
  );
}

