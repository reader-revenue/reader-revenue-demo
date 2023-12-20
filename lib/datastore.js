/**
 * @fileoverview Description of this file.
 */

import {Datastore} from '@google-cloud/datastore';

// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
function isNumeric(str) {
  if (typeof str != 'string') return false  // we only process strings!
    return !isNaN(str) &&  // use type coercion to parse the _entirety_ of the
                           // string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))  // ...and ensure strings of whitespace fail
}

const datastore = new Datastore();

class Storage {
  constructor(namespace) {
    this.namespace = namespace;
  }

  error(type, e) {
    console.log({error: `Error of type ${type}:`, e});
  }

  log(source, message) {
    console.log({source, message});
  }

  async create(type, data) {
    try {
      const task = {
        key: datastore.key('Task'),
        data: {type, data, created: Date.now(), namespace: this.namespace},
      };

      // Saves the entity
      const created = await datastore.save(task);
      this.log('create', data);
      return created;
    } catch (e) {
      this.error(`create ${type}`, e);
    }
  }

  async read(type = undefined) {
    try {
      const query = (type !== undefined) ?
          datastore.createQuery('Task')
              .filter('namespace', '=', this.namespace)
              .filter('type', '=', type)
              .order('created') :
          datastore.createQuery('Task')
              .filter('namespace', '=', this.namespace)
              .order('created');

      console.log({query});
      const [entries] = await datastore.runQuery(query);
      this.log('read', 'successfully read all entries');
      return entries;
    } catch (e) {
      this.error(`read ${type}`, e);
    }
  }

  async readByDataKeyValue(key, value) {
    try {
      console.log(isNumeric(value))
      const query = datastore.createQuery('Task')
                        .filter(
                            `data.${key}`, '=',
                            isNumeric(value) ? parseInt(value) : value)
                        .filter('namespace', '=', this.namespace)
                        .order('created');

      const [entries] = await datastore.runQuery(query);
      this.log('read', `readByDataKeyValue ${key} ${value}`);
      return entries;
    } catch (e) {
      this.error(`readByDataKeyValue ${key} ${value}`, e);
      throw e;
    }
  }
}

export {Storage}