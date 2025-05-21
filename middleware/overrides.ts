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

import { Request, Response, NextFunction, RequestHandler } from 'express';

const overrides: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const envOverrides = process.env.ENV_OVERRIDES;
    if (envOverrides) {
      const validOverrides = envOverrides.split(',');

      for (const override of validOverrides) {
        try {
          if (req.query && typeof req.query[override] === 'string') {
            const value = req.query[override] as string;
            process.env[override] = value;
            console.log(`Successfully set ${override} to ${value}`);
          }
        } catch (e) {
          // override not set or not a string, do nothing
          console.warn(`Failed to set override ${override}:`, e);
        }
      }
    }
  } catch (e) {
    // no overrides set via ENV_OVERRIDES, or other error during processing
    console.error('Error processing overrides:', e);
  }

  next();
};

export default overrides;
