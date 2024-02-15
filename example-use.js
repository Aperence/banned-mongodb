const { disconnect, connect, addUser, addCallbackOnChange, banUser } = require("./db-methods");

// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017/?replicaSet=rs0";
let client = connect(uri)
async function run() {
  try {
    //await banUser(client, "aperence")
    setTimeout(async () => await addUser(client, "test", ["test"], false), 1000)
    let changeStream = getChangeStream(client)
    for await (const change of changeStream) {
      console.log("Received change:\n", change);
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await disconnect(client)
  }
}
run().catch(console.dir);