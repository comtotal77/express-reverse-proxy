const axios = require("axios");

const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function enableIp(urlendpoint,autoriz,act) {
try {

  const response = await axios
    .patch(urlendpoint, JSON.stringify({ disabled: act }), {
      httpsAgent: agent,
      headers: {
        "content-type": "application/json",
        Authorization: process.env.AUTH_HEADER_ROUTER,
      },
    })
    
} catch (error) {
    throw error;
}

}

module.exports = enableIp;