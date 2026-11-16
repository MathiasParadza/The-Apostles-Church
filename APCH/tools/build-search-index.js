#!/usr/bin/env node
/**
 * Builds assets/js/search-index.js from the site's HTML pages.
 *
 * Run from the APCH folder whenever page content changes:
 *     node tools/build-search-index.js
 *
 * For every page it records the title, meta description and each h1-h3
 * heading with a short excerpt of the text that follows it, so the
 * site-wide search can link straight to the matching section.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'js', 'search-index.js');
const PAGE_DIRS = ['.', 'resources'];
const SKIP = new Set(['api/404.html']);
const SECTION_TEXT_LIMIT = 320;
const MAX_SECTIONS_PER_PAGE = 40;

const CATEGORY_RULES = [
    [/^index\.html$/, 'Home'],
    [/^about/i, 'About Us'],
    [/^(community|membership)/i, 'Community'],
    [/^(articles|theName)/i, 'Faith & Beliefs'],
    [/^resources(\.html|\/)/, 'Resources'],
    [/^digitLibrary/i, 'Digital Library'],
    [/^giving/i, 'Giving'],
    [/^news/i, 'News'],
    [/^store/i, 'Store'],
];

const ENTITIES = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
    rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', copy: '©',
    middot: '·', bull: '•', rarr: '→', larr: '←', eacute: 'é',
};

function decode(text) {
    return text
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
        .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function toText(html) {
    return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function categoryFor(url) {
    const rule = CATEGORY_RULES.find(([re]) => re.test(url));
    return rule ? rule[1] : 'Pages';
}

function stripChrome(body) {
    return body
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<header\b[^>]*class="[^"]*main-header[^"]*"[\s\S]*?<\/header>/gi, ' ')
        .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
        .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
        .replace(/<div\b[^>]*class="[^"]*(floating-nav|search-modal|back-to-top)[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi, ' ');
}

function cleanTitle(title) {
    return title.replace(/\s*[-|–—]\s*The Apostles'? Church.*$/i, '').trim() || title.trim();
}

function indexPage(relPath) {
    const html = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    const url = relPath.split(path.sep).join('/');
    const rawTitle = toText((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, url])[1]);
    const description = toText((html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [, ''])[1]);
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = stripChrome(bodyMatch ? bodyMatch[1] : html);

    const headingRe = /<h([1-3])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
    const headings = [];
    let m;
    while ((m = headingRe.exec(body))) {
        const text = toText(m[3]);
        if (!text || text.length < 3) continue;
        const idMatch = m[2].match(/\bid=["']([^"']+)["']/i);
        headings.push({ level: Number(m[1]), text, id: idMatch ? idMatch[1] : '', start: m.index, end: headingRe.lastIndex });
    }

    // The nearest preceding element id is a better anchor than nothing.
    const idPositions = [];
    const idRe = /<(section|article|div|aside)\b[^>]*\bid=["']([^"']+)["']/gi;
    while ((m = idRe.exec(body))) idPositions.push({ pos: m.index, id: m[2] });

    const seen = new Set();
    const sections = [];
    headings.forEach((h, i) => {
        const nextStart = i + 1 < headings.length ? headings[i + 1].start : body.length;
        const text = toText(body.slice(h.end, nextStart)).slice(0, SECTION_TEXT_LIMIT);
        let anchor = h.id;
        if (!anchor) {
            const container = idPositions.filter(p => p.pos < h.start && h.start - p.pos < 600).pop();
            if (container) anchor = container.id;
        }
        const key = h.text.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        sections.push({ h: h.text, a: anchor, t: text });
    });

    // Some pages reuse the home page <title>; prefer their own main heading.
    let title = cleanTitle(rawTitle);
    if (url === 'index.html') title = 'Home';
    else if (/^The Apostles'? Church\b/i.test(title) && sections.length) title = sections[0].h;

    return {
        u: url,
        t: title,
        d: description,
        c: categoryFor(url),
        s: sections.slice(0, MAX_SECTIONS_PER_PAGE),
    };
}

const pages = [];
for (const dir of PAGE_DIRS) {
    for (const file of fs.readdirSync(path.join(ROOT, dir)).sort()) {
        if (!file.endsWith('.html')) continue;
        const rel = path.join(dir, file);
        if (SKIP.has(rel.split(path.sep).join('/'))) continue;
        pages.push(indexPage(rel));
    }
}

const banner = '/* Generated by tools/build-search-index.js - do not edit by hand. */\n';
fs.writeFileSync(OUT, banner + 'window.APCH_SEARCH_INDEX = ' + JSON.stringify(pages) + ';\n');
const sectionCount = pages.reduce((n, p) => n + p.s.length, 0);
console.log(`Indexed ${pages.length} pages, ${sectionCount} sections -> ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
