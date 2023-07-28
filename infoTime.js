const axios = require("axios");
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function infoTime(urlendpoint,autoriz) {
try {
  const response = await axios
  .get(urlendpoint, {
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

module.exports = infoTime;