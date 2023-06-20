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

//Iniciando el servidor, escuchando...
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);

});

app.listen(3000)