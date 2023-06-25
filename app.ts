import express, { Request, Response } from "express";

import axios from "axios";
import cors from "cors";
import https from "https";

import morgan from "morgan";

const app = express();

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

app.get("/enable", async function (req: Request, res: Response) {
  const tiempo = +req.params.tiempo;

  if (!(typeof tiempo == "number")) {
    return res.status(400).send({
      message:
        "ocurrió un error con el parámetro tiempo de tu request, seguro lo enviaste mal",
    });
  }

  // TODO: regex validation for the ip param
  if (!req.params.ip) {
    return res.status(400).send({
      message:
        "ocurrió un error con el parámetro ip de tu request, seguro lo enviaste mal",
    });
  }
  if (!process.env.API_BASE_URL || !process.env.AUTH_HEADER_ROUTER) {
    return res.status(400).send({
      message: "No hay variables de entorno en el servidor",
    });
  }

  const endpoint =
    process.env.API_BASE_URL.replace(/\/$/, "") +
    "/ip/firewall/address-list/print";

  try {
    const ip = await axios.post<{ id: string }[]>(
      endpoint,
      JSON.stringify({ ".query": ["address=" + req.params.ip] }),
      {
        httpsAgent: agent,
        headers: {
          "content-type": "application/json",
          Authorization: process.env.AUTH_HEADER_ROUTER,
        },
      }
    );

    if (!ip.data[0]) {
      return res.status(400).send("ip_not_found");
    }

    const patchUrl =
      process.env.API_BASE_URL.replace(/\/$/, "") +
      "/ip/firewall/address-list/" +
      ip.data[0].id;

    const endpointEnable =
      process.env.API_BASE_URL.replace(/\/$/, "") + "/system/scheduler";

    await axios.patch(patchUrl, JSON.stringify({ disabled: false }), {
      httpsAgent: agent,
      headers: {
        "content-type": "application/json",
        Authorization: process.env.AUTH_HEADER_ROUTER,
      },
    });
    await axios.put(
      endpointEnable,
      JSON.stringify({
        name: req.params.ip,
        interval: tiempo + "m",
        "on-event":
          "ip firewall/address-list/disable [find address=" +
          req.params.ip +
          "]\r\nsystem/scheduler/remove [find name=" +
          req.params.ip +
          "]",
      }),
      {
        httpsAgent: agent,
        headers: {
          "content-type": "application/json",
          Authorization: process.env.AUTH_HEADER_ROUTER,
        },
      }
    );
  } catch (error) {
    return res.status(400).send("Error Aquí catch");
  }
  return res.status(200).send("Exito");
});

app.get("/disable", async function (req, res) {});
app.get("/check", async function (req, res) {});

/*
app.get(":endpoint([\\/\\w\\.-]*)", async function (req, res) {
  // Remove any trailing slash from base url
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
          Authorization: process.env.AUTH_HEADER_ROUTER,
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
        const endpoint2 = endpoint.replace("print", response.data[0][".id"]);
        let accion2 = accion === "disable" ? true : false;
        const response2 = await axios
          .patch(endpoint2, JSON.stringify({ disabled: accion2 }), {
            httpsAgent: agent,
            headers: {
              "content-type": "application/json",
              Authorization: process.env.AUTH_HEADER_ROUTER,
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
                      Authorization: process.env.AUTH_HEADER_ROUTER,
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
*/
//Iniciando el servidor, escuchando...
app.listen(app.get("port"), () => {
  console.log(`Server listening on port ${app.get("port")}`);
});
