const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const https = require('https')

const morgan=require('morgan');

const agent = new https.Agent({
  rejectUnauthorized: false,
})

app.set('port', process.env.PORT || 3000);

//Middleware
app.use(cors({
    origin: '*'
}))
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());


require('dotenv').config()


app.get(':endpoint([\\/\\w\\.-]*)', async function (req, res) {
    // Remove any trailing slash from base url
    const endpoint = (process.env.API_BASE_URL).replace(/\/$/, "") + req.params.endpoint
    const regex = /^\/((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\/(enable|disable|check)$/;
    const matches = req.params.endpoint.match(regex);
  
    if (matches) {
      const ip = matches[1];
      const accion = matches[2];
      const endpoint = (process.env.API_BASE_URL).replace(/\/$/, "") + "/ip/firewall/address-list/print"  

      const response =   await axios.post(endpoint, JSON.stringify({".query": ["address="+ip]}),{
        httpsAgent: agent,
        headers: {
            'content-type': 'application/json', 
            'Authorization': 'Basic dXNlcjE6MTQ3OTYzbGtqKio='
          }
        }).then(async response => {
            if (!response.data[0]) {
                res.status(400).send("ip_not_found")
                return
            }
            if (accion === "check") {
                res.status(200).send(response.data[0]["disabled"])
                return
            }
            endpoint2=endpoint.replace("print",response.data[0][".id"])
            let accion2 = (accion === "disable") ? true : false;
            const response2 =   await axios.patch(endpoint2, JSON.stringify({"disabled": accion2}),{
                httpsAgent: agent,
                headers: {
                    'content-type': 'application/json', 
                    'Authorization': 'Basic dXNlcjE6MTQ3OTYzbGtqKio='
                  }
                }).then(response2 => {
                    res.status(200).send("done");
                }).catch(error => {
                    res.json(error)
                })
        }).catch(error => {
            res.json(error)
        })
    } else {
      res.status(400).send("invalid_endpoint");
    }
})

//Iniciando el servidor, escuchando...
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);

});
