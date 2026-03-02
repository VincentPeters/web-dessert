const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const CSS_PATH = path.join(__dirname, 'src', 'css', 'style.css');
const JS_DIR = path.join(__dirname, 'src', 'js');

function parseFrontmatter(content) {
  const parts = content.split('---');
  if (parts.length < 3) return { data: {}, body: content };
  const frontmatter = parts[1].trim();
  const body = parts.slice(2).join('---').trim();
  const data = {};
  for (const line of frontmatter.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value;
  }
  return { data, body };
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function loadPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data, body } = parseFrontmatter(content);
    return {
      title: data.title || 'Untitled',
      date: data.date || '',
      slug: data.slug || file.replace('.md', ''),
      description: data.description || '',
      draft: data.draft === 'true',
      body,
    };
  })
  .filter(post => !post.draft || process.env.INCLUDE_DRAFTS)
  .sort((a, b) => b.date.localeCompare(a.date));
}

const terminalColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'dim', 'bold'];

const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }) {
  if (lang !== 'terminal') {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cls = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${cls}>${escaped}</code></pre>\n`;
  }
  let out = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  for (const c of terminalColors) {
    out = out.replace(new RegExp(`\\{${c}\\}(.*?)\\{/\\}`, 'gs'), `<span class="t-${c}">$1</span>`);
  }
  out = out.replace(/^(\$ )/gm, '<span class="t-prompt">$ </span>');
  return `<pre class="terminal"><code>${out}</code></pre>\n`;
};

marked.use({ renderer });

function buildPost(post, template, css) {
  const html = marked(post.body);
  const content = `<div class="post-header"><h1>${post.title}</h1><time datetime="${post.date}">${formatDate(post.date)}</time></div>${html}`;
  return template
    .replace('{{title}}', post.title)
    .replace('{{description}}', post.description)
    .replace('{{content}}', content)
    .replace('{{css}}', css);
}

function buildIndex(posts, template, css) {
  const items = posts.map(post => `
  <li>
    <h2><a href="/${post.slug}/">${post.draft ? '[DRAFT] ' : ''}${post.title}</a></h2>
    <time datetime="${post.date}">${formatDate(post.date)}</time>
    <p>${post.description}</p>
  </li>`).join('\n');

  const content = `<h1>Web Dessert</h1><ul class="post-list">${items}</ul>`;
  return template
    .replace('{{title}}', 'Web Dessert')
    .replace('{{description}}', 'A personal blog')
    .replace('{{content}}', content)
    .replace('{{css}}', css);
}

function build() {
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

  const template = fs.readFileSync(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');
  const css = fs.readFileSync(CSS_PATH, 'utf-8');
  const posts = loadPosts();

  for (const post of posts) {
    const postDir = path.join(DIST_DIR, post.slug);
    if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });
    const html = buildPost(post, template, css);
    fs.writeFileSync(path.join(postDir, 'index.html'), html);
    console.log(`Built: dist/${post.slug}/index.html`);
  }

  const indexHtml = buildIndex(posts, template, css);
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
  console.log('Built: dist/index.html');

  // Copy JS files
  const distJs = path.join(DIST_DIR, 'js');
  if (!fs.existsSync(distJs)) fs.mkdirSync(distJs, { recursive: true });
  for (const file of fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js'))) {
    fs.copyFileSync(path.join(JS_DIR, file), path.join(distJs, file));
    console.log(`Copied: dist/js/${file}`);
  }

  console.log(`Done. ${posts.length} post(s) built.`);
}

build();
