const fs = require('fs').promises;
const path = require('path');

const dataFile = path.join(__dirname, 'data', 'requests.json');

exports.handler = async () => {
  const data = await fs.readFile(dataFile, 'utf-8');
  const requests = JSON.parse(data);

  return {
    statusCode: 200,
    body: JSON.stringify(requests)
  };
};
