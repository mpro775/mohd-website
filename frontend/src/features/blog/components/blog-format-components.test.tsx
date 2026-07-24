import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlogInlineText } from "./BlogInlineText";
import { BlogKeyboardKey } from "./BlogKeyboardKey";
import { BlogTextBlock } from "./BlogTextBlock";
import { EnhancedCodeBlock } from "./EnhancedCodeBlock";

describe("blog format components", () => {
  it("renders allowlisted bilingual text classes", () => {
    const html = renderToStaticMarkup(
      <BlogTextBlock dir="rtl" align="justify" size="lead">
        <p>مقدمة عربية</p>
      </BlogTextBlock>,
    );
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("blog-text-align-justify");
    expect(html).toContain("blog-text-size-lead");
  });

  it("renders accessible inline highlight and keyboard key", () => {
    expect(
      renderToStaticMarkup(
        <BlogInlineText mark="true" size="lg">
          مهم
        </BlogInlineText>,
      ),
    ).toContain("blog-inline-mark");
    expect(
      renderToStaticMarkup(<BlogKeyboardKey>Ctrl + K</BlogKeyboardKey>),
    ).toContain("<kbd");
  });

  it("renders code settings without adding line numbers to copied text", () => {
    const html = renderToStaticMarkup(
      <EnhancedCodeBlock
        code={"const a = 1;\nconst b = 2;"}
        language="ts"
        meta={'title="<img onerror=alert(1)>" maxHeight="320" wrap="true" lineNumbers="true" collapsible="true" collapsed="false" highlight="2"'}
      >
        <pre>
          <code>const a = 1;{"\n"}const b = 2;</code>
        </pre>
      </EnhancedCodeBlock>,
    );
    expect(html).toContain("blog-code-height-320");
    expect(html).toContain("blog-code-wrap");
    expect(html).toContain("blog-code-line-numbers");
    expect(html).toContain("&lt;img onerror=alert(1)&gt;");
    expect(html).not.toContain("<img onerror");
    expect(html).toContain('aria-expanded="true"');
  });
});

