/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview Description of this file.
 */
import * as admonitionExtension from 'marked-admonition-extension';
import { marked } from 'marked';
import * as url from 'url';
import { create } from 'express-handlebars';
import { markedHighlight } from 'marked-highlight';
import { readFile } from 'fs/promises';
import customHeadingId from 'marked-custom-heading-id';
import hljs from 'highlight.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
function safeEnvVars() {
    const { GOOGLE_SITE_VERIFICATION, OAUTH_CLIENT_ID, PUBLICATION_ID, ENV_NAME, PROXY_URL, GTAG_PROPERTY_ID, GTAG_DEBUG_MODE, GTAG_CONSENT_MODE_ALL_DENIED, CTA_CONFIG, CTA_CONFIG_BASE64, SWG_OVERRIDE, PAY_SWG_VERSION, NEWSLETTER_CTA_CONFIGURATION_ID, SWG_SKU, } = process.env;
    return {
        GOOGLE_SITE_VERIFICATION,
        OAUTH_CLIENT_ID,
        PUBLICATION_ID,
        ENV_NAME,
        PROXY_URL,
        GTAG_PROPERTY_ID,
        GTAG_DEBUG_MODE,
        GTAG_CONSENT_MODE_ALL_DENIED,
        CTA_CONFIG,
        CTA_CONFIG_BASE64,
        SWG_OVERRIDE,
        PAY_SWG_VERSION,
        NEWSLETTER_CTA_CONFIGURATION_ID,
        SWG_SKU,
    };
}
marked.use({
    gfm: true,
    breaks: false,
}); // Added type assertion for options
marked.use(customHeadingId()); // Added type assertion
marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
}) // Added type assertion
);
// Use the extension directly, not .default, and cast to MarkedExtension
marked.use(admonitionExtension);
const partialsDir = `${__dirname}../app/views/partials/`;
const hbs = create({
    extname: '.html',
    partialsDir,
});
// Explicitly type hbs.handlebars
const handlebarsCompiler = hbs.handlebars;
async function renderMarkdown(filePath, template, data) {
    let body, compiledTemplate;
    try {
        data.env = safeEnvVars();
        const fileBuffer = await readFile(filePath);
        const markdownFile = fileBuffer.toString();
        const markdownBody = marked.parse(markdownFile);
        const handlebarMarkdownTemplate = handlebarsCompiler.compile(markdownBody);
        body = handlebarMarkdownTemplate(data);
    }
    catch (e) {
        console.error('Failed to parse markdown file', e);
        throw new Error(e.message);
    }
    try {
        const templateBuffer = await readFile(template);
        const rawTemplate = templateBuffer.toString();
        compiledTemplate = handlebarsCompiler.compile(rawTemplate);
    }
    catch (e) {
        console.error('Failed to parse template file', e);
        throw new Error(e.message);
    }
    return compiledTemplate({
        body,
        data,
    }, {
        partials: await hbs.getPartials(),
    });
}
async function renderHtml(filePath, data) {
    try {
        data.env = safeEnvVars();
        const fileBuffer = await readFile(filePath);
        const htmlFile = fileBuffer.toString();
        const htmlBodyTemplate = handlebarsCompiler.compile(htmlFile);
        return htmlBodyTemplate(data);
    }
    catch (e) {
        console.error(e);
        throw new Error(`Html file wasn't parseable: ${e.message}`);
    }
}
async function renderStaticFile(filePath, data = {}) {
    try {
        data.env = data.env || safeEnvVars(); // Ensure env is initialized
        const fileBuffer = await readFile(filePath);
        const staticFile = fileBuffer.toString();
        const pattern = /\bprocess\.env\.([A-Za-z0-9_]+)\b/g; // More specific regex
        const replacedStaticFile = staticFile.replace(pattern, (match, paramName) => {
            const value = data.env?.[paramName];
            return typeof value === 'string' ? value : match; // Keep original if not found or not string
        });
        return replacedStaticFile;
    }
    catch (e) {
        console.error(e);
        throw new Error(`Static file wasn't parseable: ${e.message}`);
    }
}
async function renderStaticImage(filePath) {
    try {
        return await readFile(filePath);
    }
    catch (e) {
        console.error(e);
        throw new Error(`Static image wasn't parseable: ${e.message}`);
    }
}
export { renderMarkdown, renderHtml, renderStaticFile, renderStaticImage };
//# sourceMappingURL=renderers.js.map