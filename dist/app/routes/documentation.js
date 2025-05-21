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
import express from 'express';
import { nav, script, options } from '../../lib/nav/documentation.js';
import { renderHtml, renderMarkdown } from '../../lib/renderers.js';
const router = express.Router();
/*
  bootstrap routes from the nav
  Loops through a structure that looks like this:
  [
    {
      section: "Section label", //Label that appears for the section
      template: 'app/views/layouts/demo-layout.html' //handlebars template
      links: [
        {
          label: 'Test', //visible label
          url: '/', //url (relative to root)
          content: 'app/content/test.md' //.md or .html to render
        },
        {
          label: 'Home',
          url: '/home',
          content: 'app/content/home.md'
        }
      ]
    }
  ]
*/
for (const section of nav()) {
    for (const route of section.links) {
        router.get(`${route.url}`, async (req, res) => {
            console.log(`${route.url} ${route.label} loading...`);
            const filetype = route.content.split('.').pop();
            let renderedHtml = '';
            try {
                renderedHtml =
                    filetype == 'md'
                        ? await renderMarkdown(route.content, section.template, {
                            nav: nav(req),
                            script: script(req),
                            options: options(req)
                        })
                        : await renderHtml(route.content, section.template, {
                            nav: nav(req),
                            script: script(req),
                            options: options(req)
                        });
            }
            catch (e) {
                console.log(e);
                renderedHtml = `<h1>error</h1><pre>${e}</pre>`;
            }
            return res.send(renderedHtml);
        });
    }
}
export default router;
//# sourceMappingURL=documentation.js.map