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

    const regex2 = /^\/((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\/(\w+)$/;
    const regex = /^\/((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\/(enable|disable)$/;
    const matches = req.params.endpoint.match(regex);
  
    if (matches) {
      const ip = matches[1];
      const accion = matches[2];
      const endpoint = (process.env.API_BASE_URL).replace(/\/$/, "") + "/ip/firewall/address-list"  
      console.log("la ip es", ip);
      console.log("la acción es", accion);
      console.log("el endpoint es", endpoint);
      const response =   await axios.get(endpoint, {
        httpsAgent: agent,
        headers: { 
            'Authorization': 'Basic dXNlcjE6MTQ3OTYzbGtqKio='
          }
    }).then(response => {
        //res.json(response.data)
        const registros = response.data;
        let output = "";
        registros.forEach((registro, index) => {
        const id = registro[".id"];
        output += `Registro ${index + 1}: ID:${id}\n`;
        });
        res.send(output);
        //res.send(response.data[".id"])
    }).catch(error => {
        res.json(error)
    })

      //res.status(200).send("Operación exitosa");


      // Resto del código de la API aquí
    } else {
      // Manejar la ruta de endpoint no válida
      res.status(400).send("Ruta de endpoint no válida");
    }

})

//Iniciando el servidor, escuchando...
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);

});
