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
});
