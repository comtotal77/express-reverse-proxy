const axios = require("axios");

const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function delScheduler(urlendpoint,autoriz) {
try {
    const responseEnable = await axios
      .delete(
        urlendpoint,
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

module.exports = delScheduler;