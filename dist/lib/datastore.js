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
/**
 * @fileoverview A helper class for storing and retreiving data from a
 * configured Cloud Datastore database.
 */
import { Datastore as DatastoreClient } from '@google-cloud/datastore';
// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
function isNumeric(str) {
    if (typeof str !== 'string')
        return false;
    return !isNaN(parseFloat(str)) && isFinite(Number(str));
}
const datastore = new DatastoreClient(); // Use the alias
class Storage {
    namespace;
    constructor(namespace) {
        this.namespace = namespace;
    }
    error(type, e) {
        console.error({ error: `Error of type ${type}:`, details: e });
    }
    log(source, message) {
        console.log({ source, message });
    }
    async create(type, data) {
        try {
            const taskKey = datastore.key(['Task']);
            const taskEntity = {
                key: taskKey,
                data: { type, data, created: Date.now(), namespace: this.namespace },
            };
            // datastore.save() returns Promise<[google.datastore.v1.ICommitResponse]>
            const response = await datastore.save(taskEntity);
            this.log('create', { type, data, id: taskKey.id || taskKey.name });
            return response;
        }
        catch (e) {
            this.error(`create ${type}`, e);
            return undefined;
        }
    }
    async read(type) {
        try {
            let query = datastore.createQuery('Task')
                .filter('namespace', '=', this.namespace)
                .order('created');
            if (type !== undefined) {
                query = query.filter('type', '=', type);
            }
            this.log('read query', { namespace: this.namespace, type });
            const [entities] = await datastore.runQuery(query);
            this.log('read result', `successfully read ${entities.length} entries`);
            return entities.map(entity => {
                const entityKey = entity[DatastoreClient.KEY]; // Use static DatastoreClient.KEY
                return { ...entity, id: entityKey?.id || entityKey?.name };
            });
        }
        catch (e) {
            this.error(`read ${type || 'all types'}`, e);
            return undefined;
        }
    }
    async readByDataKeyValue(key, value) {
        try {
            const processedValue = isNumeric(value) ? parseInt(value, 10) : value;
            const query = datastore.createQuery('Task')
                .filter(`data.${key}`, '=', processedValue)
                .filter('namespace', '=', this.namespace)
                .order('created');
            this.log('readByDataKeyValue query', { namespace: this.namespace, key, value: processedValue });
            const [entities] = await datastore.runQuery(query);
            this.log('readByDataKeyValue result', `found ${entities.length} entries for ${key}=${processedValue}`);
            return entities.map(entity => {
                const entityKey = entity[DatastoreClient.KEY]; // Use static DatastoreClient.KEY
                return { ...entity, id: entityKey?.id || entityKey?.name };
            });
        }
        catch (e) {
            this.error(`readByDataKeyValue ${key} ${value}`, e);
            throw e;
        }
    }
}
export { Storage };
//# sourceMappingURL=datastore.js.map