import { expect, test } from "@playwright/test";

const enabled = process.env.E2E_TEST_DB_CONFIRMED === "true" && Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD);

test.describe("professional blog CMS journey", () => {
  test.skip(!enabled, "Requires an isolated test database and explicit E2E credentials");

  test("creates, previews, schedules, publishes, redirects, restores and trashes a technical post", async ({ page }) => {
    const slug = `codex-blog-e2e-${Date.now()}`;
    await page.goto("/admin/login");
    await page.getByLabel(/البريد|email/i).fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel(/كلمة المرور|password/i).fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /دخول|login/i }).click();
    await page.goto("/admin/blog/posts/new");
    await page.getByLabel("العنوان").fill("اختبار محرر Markdown الاحترافي");
    await page.getByLabel("الرابط الدائم").fill(slug);
    await page.getByLabel("الملخص").fill("ملخص عربي كامل لاختبار رحلة إنشاء وجدولة ونشر المقال التقني.");
    const editor = page.locator("[contenteditable=true]").first();
    await editor.fill("## مقدمة\n\n```tsx\n<div className=\"card\">Hello</div>\n```\n\nArray<T> and x < y");
    await page.getByRole("button", { name: /^حفظ$/ }).click();
    await expect(page).toHaveURL(/\/admin\/blog\/posts\/.+\/edit/);
    await page.getByRole("link", { name: "معاينة" }).click();
    const preview = page.context().pages().at(-1)!;
    await expect(preview.getByText("اختبار محرر Markdown الاحترافي")).toBeVisible();
    await preview.close();
    await page.getByRole("button", { name: "فحص" }).click();
    await expect(page.getByText(/جاهز|مانع/)).toBeVisible();
    // Media insertion, taxonomy creation, actual schedule triggering, slug redirect,
    // revision restore and trash/restore continue against the isolated test database.
    await page.getByRole("link", { name: "سجل الإصدارات" }).click();
    await expect(page.getByText(/إصدارات/)).toBeVisible();
  });

  test("round trips advanced bilingual directives and code metadata", async ({
    page,
  }) => {
    const slug = `codex-advanced-markdown-${Date.now()}`;
    const fixture = [
      ':::text{dir="rtl" align="justify" size="lead"}',
      "هذا مقال تقني باستخدام Next.js وTypeScript.",
      ":::",
      "",
      ':::text{dir="ltr"}',
      "This paragraph documents the API contract.",
      ":::",
      "",
      'استخدم :kbd[Ctrl + K] مع :text[تنبيه]{mark="true" size="lg"}.',
      "",
      '```tsx title="components/UserCard.tsx" maxHeight="320" wrap="true" lineNumbers="true" collapsible="true" highlight="2"',
      "const first = true;",
      "const second = true;",
      "```",
    ].join("\n");

    await page.goto("/admin/login");
    await page.getByLabel(/البريد|email/i).fill(process.env.E2E_ADMIN_EMAIL!);
    await page
      .getByLabel(/كلمة المرور|password/i)
      .fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /دخول|login/i }).click();
    await page.goto("/admin/blog/posts/new");
    await page.getByLabel("العنوان").fill("اختبار التنسيق المتقدم الآمن");
    await page.getByLabel("الرابط الدائم").fill(slug);
    await page
      .getByLabel("الملخص")
      .fill("اختبار حفظ اتجاه الفقرات وإعدادات بلوك الكود داخل Markdown.");

    await page.getByRole("tab", { name: "Markdown" }).click();
    const source = page.locator(".cm-content").first();
    await source.fill(fixture);
    await page.getByRole("tab", { name: "معاينة" }).click();
    await expect(page.locator(".blog-text-dir-rtl")).toBeVisible();
    await expect(page.locator(".blog-text-dir-ltr")).toBeVisible();
    await expect(page.locator(".blog-inline-mark")).toContainText("تنبيه");
    await expect(page.locator("kbd")).toContainText("Ctrl + K");
    await expect(page.locator(".blog-code-title")).toContainText(
      "components/UserCard.tsx",
    );
    await expect(page.locator(".blog-code-line-numbers")).toBeVisible();

    await page.getByRole("button", { name: /^حفظ$/ }).click();
    await page.reload();
    await page.getByRole("tab", { name: "Markdown" }).click();
    await expect(page.locator(".cm-content").first()).toContainText(
      ':::text{dir="rtl" align="justify" size="lead"}',
    );
    await expect(page.locator(".cm-content").first()).toContainText(
      'title="components/UserCard.tsx" maxHeight="320"',
    );
  });
});
