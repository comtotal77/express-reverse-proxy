const axios = require("axios");

const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function infoScheduler(ip,urlendpoint,autoriz) {
try {
  const response = await axios
  .post(urlendpoint, JSON.stringify({ ".query": ["name=" + ip] }), {
    httpsAgent: agent,
    headers: {
      "content-type": "application/json",
      Authorization: autoriz
    },
  })
  return response.data;
} catch (error) {
    throw error;
}

}

module.exports = infoScheduler;