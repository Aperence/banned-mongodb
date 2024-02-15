const { disconnect, connect, addUser, addCallbackOnChange, banUser } = require("./db-methods");
var config = require('./config.json');
const express = require('express')
const app = express()
const port = 3000

const uri = config.db;
let client = connect(uri)

addCallbackOnChange(client, (next) => {
    // do something useful with it
    console.log(next)
})

/*
 * curl -X POST localhost:3000/users/t/aperence/false
 */
app.post('/users/:token/:name/:assistant', async (req, res) => {
    let token = req.params.token
    let name = [req.params.name]
    let assistant = req.params.assistant === "true"
    await addUser(client, token, name, assistant)
    res.send("ok")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
