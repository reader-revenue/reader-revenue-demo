/**
 * Copyright 2024 Google LLC
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
import { renderStaticFile, renderStaticImage } from '../../lib/renderers.js';
const img = express.Router();
const js = express.Router();
const css = express.Router();
img.get('/*', async (req, res) => {
    try {
        const image = await renderStaticImage(`public/img/${req.path}`);
        res.set('Content-Type', `image/${req.path.split('.').pop()}`).end(image);
    }
    catch (e) {
        res.status(500).end(`Error: failed to render ${req.path}`);
    }
});
js.get('/*', async (req, res) => {
    try {
        console.log(req.path);
        const renderedStaticFile = await renderStaticFile(`public/js/${req.path}`);
        res.set('Content-Type', 'text/javascript').end(renderedStaticFile);
    }
    catch (e) {
        res.status(500).end(`Error: failed to render ${req.path}`);
    }
});
css.get('/*', async (req, res) => {
    try {
        const renderedStaticFile = await renderStaticFile(`public/css/${req.path}`);
        res.set('Content-Type', 'text/css').end(renderedStaticFile);
    }
    catch (e) {
        res.status(500).end(`Error: failed to render ${req.path}`);
    }
});
export { img, js, css };
//# sourceMappingURL=static-handlers.js.map