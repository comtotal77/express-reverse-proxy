const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const https = require('https')

const agent = new https.Agent({
  rejectUnauthorized: false,
})

app.use(cors({
    origin: '*'
}))

require('dotenv').config()


app.get(':endpoint([\\/\\w\\.-]*)', function (req, res) {
    // Remove any trailing slash from base url
    const endpoint = (process.env.API_BASE_URL).replace(/\/$/, "") + req.params.endpoint

    
    axios.get(endpoint, {
        httpsAgent: agent,
        headers: { 
            'Authorization': 'Basic dXNlcjE6MTQ3OTYzbGtqKio='
          }
    }).then(response => {
        res.json(response.data)
    }).catch(error => {
        res.json(error)
    })
})


app.listen(3000)