export const getInstance = (baseURL: string = "/api") => {
  return async (url: string, options: RequestInit = {}) => {
    try {
        const headers = {
            Content: "application/json",
            ...options.headers,
        }

      const response = await fetch(baseURL + url, { ...options, headers })

      if (!response.ok) {
        return responseError(response)
      }

      return await response
    } catch (error) {
      console.log("error->", "Request error", error)
      return responseError(error as Response)
    }
  }
}

async function responseError(response: Response) {
  console.log("error->", "Request error", response)

  if (!response) {
    return Promise.reject({ message: "Unknown error" })
  }

  const data = await response.json()

  if (response?.status === 401) {
    window.location.replace("/")
    return Promise.reject({ message: "Unauthorized, redirecting..." })
  }

  if (data) {
    return Promise.reject(data)
  }

  return Promise.reject(response)
}