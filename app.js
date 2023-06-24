const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const https = require("https");

const morgan = require("morgan");

const agent = new https.Agent({
  rejectUnauthorized: false,
});

require("dotenv").config();
app.set("port", process.env.PORT || 3000);

//Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get(":endpoint([\\/\\w\\.-]*)", async function (req, res) {
  // Remove any trailing slash from base url
  const endpoint =
    process.env.API_BASE_URL.replace(/\/$/, "") + req.params.endpoint;
  const regex =
    /^\/((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\/(enable|disable|check)(?:\/([1-9]|1[0-9]|2[0-4]))?$/;
  const matches = req.params.endpoint.match(regex);

  if (matches) {
    const ip = matches[1];
    const accion = matches[2];
    const tiempo = matches[3];
    const endpoint =
      process.env.API_BASE_URL.replace(/\/$/, "") +
      "/ip/firewall/address-list/print";

    const response = await axios
      .post(endpoint, JSON.stringify({ ".query": ["address=" + ip] }), {
        httpsAgent: agent,
        headers: {
          "content-type": "application/json",
          Authorization: "Basic dXNlcjE6MTQ3OTYzbGtqKio=",
        },
      })
      .then(async (response) => {
        if (!response.data[0]) {
          res.status(400).send("ip_not_found");
          return;
        }
        if (accion === "check") {
          let estado =
            response.data[0]["disabled"] === "true" ? "disable" : "enable";
          res.status(200).send(estado);
          return;
        }
        endpoint2 = endpoint.replace("print", response.data[0][".id"]);
        let accion2 = accion === "disable" ? true : false;
        const response2 = await axios
          .patch(endpoint2, JSON.stringify({ disabled: accion2 }), {
            httpsAgent: agent,
            headers: {
              "content-type": "application/json",
              Authorization: "Basic dXNlcjE6MTQ3OTYzbGtqKio=",
            },
          })
          .then(async (response2) => {
            if (accion === "enable") {
              const endpointEnable =
                process.env.API_BASE_URL.replace(/\/$/, "") +
                "/system/scheduler";
              const responseEnable = await axios
                .put(
                  endpointEnable,
                  JSON.stringify({
                    name: ip,
                    interval: tiempo + "m",
                    "on-event":
                      "ip firewall/address-list/disable [find address=" +
                      ip +
                      "]\r\nsystem/scheduler/remove [find name=" +
                      ip +
                      "]",
                  }),
                  {
                    httpsAgent: agent,
                    headers: {
                      "content-type": "application/json",
                      Authorization: "Basic dXNlcjE6MTQ3OTYzbGtqKio=",
                    },
                  }
                )
                .then((responseEnable) => {
                  res.status(200).send(accion + "d:" + tiempo);
                  return;
                })
                .catch((error) => {
                  res.json(error);
                  return;
                });
            } else {
              res.status(200).send(accion + "d");
            }
          })
          .catch((error) => {
            res.json(error);
          });
      })
      .catch((error) => {
        res.json(error);
      });
  } else {
    res.status(400).send("invalid_endpoint");
  }
});

//Iniciando el servidor, escuchando...
app.listen(app.get("port"), () => {
  console.log(`Server listening on port ${app.get("port")}`);
});
