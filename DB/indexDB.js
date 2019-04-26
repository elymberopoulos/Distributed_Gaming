

const getpeers = require('../public/js/index')



const dbName = "idTable";

  function startDB(peerIDs)
  {
    console.log("DB Successfully Started");
    var request = indexedDB.open(dbName, 1);
    request.onerror = function(event) {
      // Handle errors.
        console.log("Error:",event);
    };
    
    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      console.log("Upgrade starting");
      // Create an objectStore to hold information about our peers. We're
      // use "peerID" as our key path because it's guaranteed to be unique
      //(see simple-peer documentation) 
      var objectStore = db.createObjectStore("peers");

      // Create an index to search customers by email. We want to ensure that
      // no two customers have the same email, so use a unique index.
      //objectStore.createIndex("peer", "peer", { unique: true });

      // Use transaction oncomplete to make sure the objectStore creation is 
      // finished before adding data into it.
      objectStore.transaction.oncomplete = function(event) {
        console.log("on complete started")
        // Store values in the newly created objectStore.
        var customerObjectStore = db.transaction("peers", "readwrite").objectStore("peers");
        console.log("Adding to DB")

        //peerIDs.forEach(peer => {
          //console.log("Putting into DataBase",peer)
          customerObjectStore.add(peerIDs[0],1);
        //});
      };
    };


   /* var getPeer = (peerID) =>
    {
        db.transaction("peers").objectStore("peer").get(peerID).onsuccess = function(event) {
            
            console.log("Success",event.target.name)
        };

    }

    console.log(getPeer(peerID));

    var distributePeers = () => 
    {
        peerIDs.forEach(peerID => {

            var curID = getPeer(peerID)
            console.log("got:",curID)

        })
    }
  }*/
  }
  module.exports = {startDB}




