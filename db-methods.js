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

function addCallbackOnChange(client, callback){
    getChangeStream(client).on("change", callback);
}

async function addUser(client, token, usernames, isAssistant){
    const users = client.db('auth').collection('auth');
    let found = await users.findOne({"token" : token});
    if (found){
        for (let u of usernames){
            if (found["discordUsers"].includes(u)) continue
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

async function disconnect(client){
    await client.close()
}

module.exports = {
    "connect" : connect,
    "getChangeStream" : getChangeStream,
    "addCallbackOnChange" : addCallbackOnChange,
    "addUser" : addUser,
    "banUser" : banUser,
    "disconnect" : disconnect
}