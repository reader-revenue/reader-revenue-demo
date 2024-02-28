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

class AnalyticsEventHandler {
    constructor(verbose = true) {
      this.events = [];
      this.callbacks = [];
      this.verbose = verbose;
    }

    log(...messages) {
        if(this.verbose === true) {
            console.log(...messages);
        }
    }
  
    logEvent(event) {
        this.events.push(event);
        this.log("New analytics event: ", event);
    }
  
    logCallback(callback) {
        this.callbacks.push(callback);
        this.log("New callback: ", callback);
    }

    get latestEvent() {
        return this.events.slice(-1)[0] ?? undefined;
    }

    get penultimateEvent() {
        return this.events.slice(-2)[0] ?? undefined;
    }

    get latestCallback() {
        return this.callbacks.slice(-1)[0] ?? undefined;
    }
  
    determineIntent() {

        if (
            //latest event was 'close' and linking was successful
            this.latestEvent?.eventType === 1086 && //closed
            this.latestCallback?.success === true 
        ) {
            return {
                determination: 'success',
                message: 'dialog has closed after successful linking'
            }
        } else if (
            //latest event was 'close' and linking failed
            //and previous event was 'failed'
            //and there was an attempt at linking and it failed
            this.latestEvent?.eventType === 1086 && //closed
            this.penultimateEvent?.eventType === 2005 && //failed
            this.latestCallback?.success === false
        ) {
            return {
                determination: 'failure',
                message: 'dialog has been closed after linking has failed'
            }
        } else if (
            //latest event was 'close'
            //and the previous event was 'open'
            //and there was not a successful link
            this.latestEvent?.eventType === 1086 && //closed
            this.penultimateEvent?.eventType === 40 && //opened
            this.latestCallback?.success === (false || undefined)
        ) {
            return {
                determination: 'declined',
                message: 'dialog has been explicitly closed without linking'
            }
        } else {
            return {
                determination: undefined,
                message: 'Indeterminate state',
                latestEvent: this.latestEvent,
                latestCallback: this.latestCallback
            }
        }
    }
  }

  export { AnalyticsEventHandler }
