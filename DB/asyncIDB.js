const getpeers = require('../public/js/index');
import { openDB, deleteDB, wrap, unwrap } from 'idb';
const openDB = require('op')
async function startDB() {
    const db = await openDB('idTables', 1, {
      upgrade(db) {
        // Create a store of objects
        const store = db.createObjectStore('peers', {
          // The 'id' property of the object will be the key.
          keyPath: 'PeerID',
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        });
        // Create an index on the 'date' property of the objects.
        store.createIndex('peer', 'peer');
      },
    });
   
    // Add an article:
    await db.add('peer',
    {
        peerid: getpeers.getpeers()
    });
}

module.exports = {
    startDB
}