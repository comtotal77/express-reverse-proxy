const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const https = require("https");

const difTiempo = require("./difTiempo");
const infoIp = require("./infoIp");
const infoTime = require("./infoTime");
const infoScheduler = require("./infoScheduler");
const enableIp = require("./enableIp");
const addScheduler = require("./addScheduler");
const tranScheduler = require("./tranScheduler");
const delScheduler = require("./delScheduler");

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
    /^\/((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\/(enable|disable|check)(?:\/([1-9]|[1-9][0-9]{1,3}|[1-4][0-9]{3}|5000))?$/;
  const matches = req.params.endpoint.match(regex);

  const regex2 =
    /^\/((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\/((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))?$/;
  const matches2 = req.params.endpoint.match(regex2);

  if (matches2) {
    const ip1 = matches2[1];
    const ip2 = matches2[2];

    //////habilita y desabilita ip
    const endpoint =
      process.env.API_BASE_URL.replace(/\/$/, "") +
      "/ip/firewall/address-list/print";

    let infoIp1;
    try {
      infoIp1 = await infoIp(ip1, endpoint, process.env.AUTH_HEADER_ROUTER);
    } catch (error) {
      res.status(400).send("ip_not_found");
    }
    const endpointadd =
      process.env.API_BASE_URL.replace(/\/$/, "") +
      "/ip/firewall/address-list/" +
      infoIp1[0][".id"];

    try {
      let enableIp1 = await enableIp(
        endpointadd,
        process.env.AUTH_HEADER_ROUTER,
        true
      );
    } catch (error) {
      res.status(400).send("ip_not_found");
    }

    let infoIp2;
    try {
      infoIp2 = await infoIp(ip2, endpoint, process.env.AUTH_HEADER_ROUTER);
    } catch (error) {
      res.status(400).send("ip_not_found");
    }
    const endpointadd2 =
      process.env.API_BASE_URL.replace(/\/$/, "") +
      "/ip/firewall/address-list/" +
      infoIp2[0][".id"];
    try {
      let enableIp2 = await enableIp(
        endpointadd2,
        process.env.AUTH_HEADER_ROUTER,
        false
      );
    } catch (error) {
      res.status(400).send("ip_not_found");
    }
    //////elimina y crea scheduler
    ///consulta scheduler

    const endpointsched =
      process.env.API_BASE_URL.replace(/\/$/, "") + "/system/scheduler/print";
    let infoScheduler1;
    try {
      infoScheduler1 = await infoScheduler(
        ip1,
        endpointsched,
        process.env.AUTH_HEADER_ROUTER
      );
    } catch (error) {
      res.status(400).send("ip_not_found");
    }

    ///guarda el tiempo, stardate y starttime
    const startdate = infoScheduler1[0]["start-date"];
    const starttime = infoScheduler1[0]["start-time"];
    const interval = infoScheduler1[0]["interval"];
    const id = infoScheduler1[0][".id"];

    ///con id elimina scheduler

    const endpointdel =
      process.env.API_BASE_URL.replace(/\/$/, "") + "/system/scheduler/" + id;
    let delSched1;
    try {
      delSched1 = await delScheduler(
        endpointdel,
        process.env.AUTH_HEADER_ROUTER
      );
    } catch (error) {
      res.status(400).send("ip_not_found");
    }


    //crea nuevo scheduler

    const endpointtrans =
      process.env.API_BASE_URL.replace(/\/$/, "") + "/system/scheduler";
    let tranSched1;
    try {
      tranSched1 = await tranScheduler(
        ip2,
        startdate,
        starttime,
        interval,
        endpointtrans,
        process.env.AUTH_HEADER_ROUTER
      );
    } catch (error) {
      res.status(400).send("ip_not_found");
    }
    //res.status(200).send("ok");
  }
else {
  if (matches) {
    const ip = matches[1];
    const accion = matches[2];
    const tiempo = matches[3];

    const endpoint =
      process.env.API_BASE_URL.replace(/\/$/, "") +
      "/ip/firewall/address-list/print";
    let infoIp1;
    try {
      infoIp1 = await infoIp(ip, endpoint, process.env.AUTH_HEADER_ROUTER);
    } catch (error) {
      res.status(400).send("ip_not_found");
    }
    const estadoIp = infoIp1[0]["disabled"] === "true" ? "disable" : "enable";

    if (accion === "check") {
      if (estadoIp === "enable") {
        //consulto hora actual
        const endpoint =
          process.env.API_BASE_URL.replace(/\/$/, "") + "/system/clock";
        let infoTime1;
        try {
          infoTime1 = await infoTime(endpoint, process.env.AUTH_HEADER_ROUTER);
        } catch (error) {
          res.status(400).send("ip_not_found");
        }
        const timeActual = infoTime1["date"] + " " + infoTime1["time"];

        //consulto tiempo consumido
        const endpoint2 =
          process.env.API_BASE_URL.replace(/\/$/, "") +
          "/system/scheduler/print";
        let infoScheduler1;
        try {
          infoScheduler1 = await infoScheduler(
            ip,
            endpoint2,
            process.env.AUTH_HEADER_ROUTER
          );
        } catch (error) {
          res.status(400).send("ip_not_found");
        }
        //const timeActual = infoScheduler1["date"] + " " + infoScheduler1["time"];
        const fecha1 = infoScheduler1[0]["next-run"].split(" ");
        let fecha1def = "";
        if (fecha1.length === 1) {
          fecha1def = infoScheduler1.data["date"] + " " + fecha1[0];
        } else {
          fecha1def =
            fecha1[0].replace(/(\d{2}:\d{2}:\d{2})$/, "2023 $1") +
            " " +
            fecha1[1];
        }

        const tiempo_resta = difTiempo(infoTime1, fecha1def);
        return res.status(200).send(tiempo_resta);
      } else {
        res.status(200).send("00:00:00:00");
        return;
      }
    }
    if (accion === "disable") {
    }

    if (accion === "enable") {
      const endpointadd =
        process.env.API_BASE_URL.replace(/\/$/, "") +
        "/ip/firewall/address-list/" +
        infoIp1[0][".id"];

      let enableIp1;
      try {
        enableIp1 = await enableIp(
          endpointadd,
          process.env.AUTH_HEADER_ROUTER,
          false
        );
      } catch (error) {
        res.status(400).send("ip_not_found");
      }

      const endpointadd2 =
        process.env.API_BASE_URL.replace(/\/$/, "") + "/system/scheduler";
      let addSched1;
      try {
        addSched1 = await addScheduler(
          ip,
          tiempo,
          endpointadd2,
          process.env.AUTH_HEADER_ROUTER
        );
      } catch (error) {
        res.status(400).send("ip_not_found");
      }
      res.status(200).send("enabled:" + tiempo);
    }
  } else {
    res.status(400).send("invalid_endpoint");
  }
  
  }
  res.status(200).send("ok");
});

//Iniciando el servidor, escuchando...
app.listen(app.get("port"), () => {
  console.log(`Server v1.1 listening on port ${app.get("port")}`);
});
