const axios = require("axios");

const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function tranScheduler(ip,startdate,starttime,interval,urlendpoint,autoriz) {
try {
    const responseEnable = await axios
      .put(
        urlendpoint,
        JSON.stringify({
          name: ip,
          "start-date": startdate,
          "start-time": starttime,
          interval: interval,
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
  return responseEnable.data;
} catch (error) {
    throw error;
}

}

module.exports = tranScheduler;