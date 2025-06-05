let requests = []; // in-memory global array (resets every time function restarts)

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify(requests),
      };
    }
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!event.body) {
    return { statusCode: 400, body: "Missing request body" };
  }

  let requestData;
  try {
    requestData = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const newRequest = {
    id: Date.now().toString(),
    ...requestData,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  requests.push(newRequest);

  return {
    statusCode: 200,
    body: JSON.stringify(newRequest),
  };
};
