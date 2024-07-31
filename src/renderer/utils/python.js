export default async (url, method, data) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }

  if (method !== 'GET') {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)

  if (response.ok) {
    const result = await response.json()
    return result
  } else {
    throw new Error(response.statusText)
  }
}
