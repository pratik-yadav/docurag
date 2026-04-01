const TIMEOUT_MESSAGE =
  'The server is taking too long to respond. It may still be starting up — please wait a moment and try again.'

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(TIMEOUT_MESSAGE)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
