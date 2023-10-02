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

const overrides = (req, res, next) => {
  const validOverrides = process.env.ENV_OVERRIDES.split(',');

  for (let override of validOverrides) {
    try {
      if (override in req.query) {
        process.env[override] = req.query[override];
        console.log(`
                    successfully set ${override} to ${req.query[override]}`);
      }
    } catch (e) {
      // override not set, do nothing
    }
  }

  next();
};

export default overrides;
