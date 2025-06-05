export async function pingTest() {
  const res = await fetch('/api/test');
  return res.json();
}

export async function submitTestRequest() {
  const res = await fetch('/api/submitRequest', { method: 'POST' });
  return res.json();
}

export async function getAllRequests() {
  const res = await fetch('/api/getRequests');
  return res.json();
}
