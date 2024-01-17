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

import * as admonition from 'marked-admonition-extension';
import * as marked from 'marked';
import * as url from 'url';
import {create} from 'express-handlebars';
import {markedHighlight} from 'marked-highlight';
import {readFile} from 'fs/promises';
import customHeadingId from 'marked-custom-heading-id';
import hljs from 'highlight.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function safeEnvVars() {
  const {GOOGLE_SITE_VERIFICATION, OAUTH_CLIENT_ID, PUBLICATION_ID, ENV_NAME} =
      process.env;
  return {GOOGLE_SITE_VERIFICATION, OAUTH_CLIENT_ID, PUBLICATION_ID, ENV_NAME};
}

marked.use({
  gfm: true,
  breaks: false,
});
marked.use(customHeadingId());
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, {language}).value;
    },
  })
);
marked.use(admonition.default);

const partialsDir = `${__dirname}../app/views/partials/`;

const hbs = create({
  extname: '.html',
  extName: '.html',
  partialsDir,
});

async function renderMarkdown(filePath, template, data) {
  let body, compiledTemplate;

  try {
    // propagate safe env vars to templates
    data.env = safeEnvVars();

    // create a content template from the markdown doc
    const markdownFile = await readFile(filePath).then((buf) => buf.toString());
    const markdownBody = marked.parse(markdownFile);
    const handlebarMarkdownTemplate = hbs.handlebars.compile(markdownBody);
    body = handlebarMarkdownTemplate(data);
  } catch (e) {
    console.log('Failed to parse markdown file', e);
    throw new Error(e.message);
  }

  try {
    //create a handlebars layout with content from markdown
    const rawTemplate = await readFile(template).then((buf) => buf.toString());

    compiledTemplate = hbs.handlebars.compile(rawTemplate);
  } catch (e) {
    console.log('Failed to parse template file', e);
    throw new Error(e.message);
  }

  return compiledTemplate(
    {
      body,
      data,
    },
    {
      partials: await hbs.getPartials(),
    }
  );
}

async function renderHtml(filePath, template, data) {
  try {
    // propagate safe env vars to templates
    data.env = safeEnvVars();
    const htmlFile = await readFile(filePath).then((buf) => buf.toString());
    const htmlBody = handlebars.compile(htmlFile);
    return htmlBody(data);
  } catch (e) {
    console.log(e);
    throw new Error("Html file wasn't parseable", e);
  }
}

async function renderStaticFile(filePath, data = {}) {
  try {
    // propagate safe env vars to templates
    data.env = safeEnvVars();
    const staticFile = await readFile(filePath).then((buf) => buf.toString());

    //find/replace for only process.env.*
    const pattern = /\bprocess\.env\.([^\s]+)\b/g;
    const replacedStaticFile = staticFile.replace(pattern, (match, paramName) => {
      const value = data.env[paramName];
      return value ? value : match; // Keep original if not found
    });
  
    return replacedStaticFile;

  } catch (e) {
    console.log(e);
    throw new Error("Static file wasn't parseable", e);
  }
}

async function renderStaticImage(filePath) {
  try {
    return await readFile(filePath);
  } catch (e) {
    console.log(e);
    throw new Error("Static image wasn't parseable", e);
  }
}

export {renderMarkdown, renderHtml, renderStaticFile, renderStaticImage};
