import fs from "node:fs/promises";
import path from "node:path";

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "latest.md");
  let markdown = "# Latest Deploy\n\n(latest.md not found)";
  try {
    markdown = await fs.readFile(filePath, "utf8");
  } catch {}
  return { props: { markdown } };
}

export default function Latest({ markdown }: { markdown: string }) {
  return (
    <main style={{ maxWidth: 780, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ display: "none" }}>Latest Deploy</h1>
      <article
        style={{
          background: "#0b0b0b",
          color: "#eaeaea",
          borderRadius: 12,
          padding: 16,
          whiteSpace: "pre-wrap",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
        }}
      >
        {markdown}
      </article>
    </main>
  );
}