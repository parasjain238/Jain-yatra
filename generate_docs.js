const fs = require('fs');
const HTMLtoDOCX = require('html-to-docx');

async function generateDocs() {
  const { marked } = await import('marked');
  console.log("Reading Markdown file...");
  const md = fs.readFileSync('MASTER_PROJECT_DOCUMENTATION.md', 'utf-8');

  console.log("Compiling Markdown to HTML...");
  const html = marked.parse(md);

  console.log("Generating DOCX file...");
  const docxBuffer = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  fs.writeFileSync('MASTER_PROJECT_DOCUMENTATION.docx', docxBuffer);
  console.log("MASTER_PROJECT_DOCUMENTATION.docx successfully created.");
}

generateDocs().catch(console.error);
