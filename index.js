const { MongoClient } = require("mongodb");

function connect(uri){
    return new MongoClient(uri);
}

async function banUser(client, user){
    const users = client.db('auth').collection('auth');
    const updateDoc = {
        $set: {
          "isBanned" : true
        },
    };
    await users.updateMany({"discordUsers" : {"$in": [user]}}, updateDoc)
}

// Note : you have to use a replicaSet to use changeStreams https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/
function getChangeStream(client){
  const database = client.db("auth");
  const users = database.collection("auth");
  return users.watch();
}

async function addUser(client, token, usernames, isAssistant){
    const users = client.db('auth').collection('auth');
    let found = await users.findOne({"token" : token});
    if (found){
        for (let u of usernames){
            found["discordUsers"].push(u)
        }
        await users.replaceOne({"token" : token}, found)
    }else{
        await users.insertOne({
            "token" : token,
            "discordUsers" : usernames,
            "isAssistant" : isAssistant,
            "isBanned" : false,
            "isVerified" : false
        })
    }
}


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
    await client.close();
  }
}
run().catch(console.dir);