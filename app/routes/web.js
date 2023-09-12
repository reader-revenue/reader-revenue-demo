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

import nav from '../lib/nav.js';

const router = express.Router();

router.use(express.static('public'));

const renderOptions = (req) => {
  return {
    data: {
      nav: nav(req),
    },
    layout: false,
  };
};

router.get('/', (req, res) => {
  return res.render('index', renderOptions(req));
});

router.get('/:path', (req, res) => {
  const validRoutes = nav(req).map((route) => {
    console.log(route.url.substring(1));
    return route.url.substring(1) === '' ? 'index' : route.url.substring(1);
  });

  const validFile = validRoutes.includes(req.params.path)
    ? req.params.path
    : 'index';
  console.log(validFile, renderOptions(req));
  return res.render(validFile, renderOptions(req));
});

export default router;
