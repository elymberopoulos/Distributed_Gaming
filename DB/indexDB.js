const dbName = "idTable";

var request = indexedDB.open(dbName, 2);

request.onerror = function(event) {
  // Handle errors.
    console.log("Error:",event)
};
request.onupgradeneeded = function(event) {
  var db = event.target.result;

  // Create an objectStore to hold information about our peers. We're
  // use "peerID" as our key path because it's guaranteed to be unique
  //(see simple-peer documentation) 
  var objectStore = db.createObjectStore("peers", { keyPath: "peerID" });

  // Create an index to search customers by email. We want to ensure that
  // no two customers have the same email, so use a unique index.
  objectStore.createIndex("peer", "peer", { unique: true });

  // Use transaction oncomplete to make sure the objectStore creation is 
  // finished before adding data into it.
  objectStore.transaction.oncomplete = function(event) {
    // Store values in the newly created objectStore.
    var customerObjectStore = db.transaction("peers", "readwrite").objectStore("peers");
    if(peerID.length === 2)
    {
    peerIDs.forEach(peer => {
      customerObjectStore.add(peer);
    });
    }
  };
};


var getPeer = (peerID) =>

{
    db.transaction("peers").objectStore("peer").get(peerID).onsuccess = function(event) {
        
        console.log("Success",event.target.name)
    };

}

var distributePeers = () => 
{
    peerIDs.forEach(peerID => {

        var curID = getPeer(peerID)
        console.log("got:",curID)

    })
}
    