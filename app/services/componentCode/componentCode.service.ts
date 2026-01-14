import { ComponentCodeApi } from "@/app/api/componentCode/type"
import { getInstance } from "../request"

const request = getInstance()

export const createComponentCode = async (
    params: ComponentCodeApi.createRequest,
  ): Promise<ComponentCodeApi.detailResponse> => {
    try {

        const response = await request("/componentCode/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        })

        return await response.json()

    } catch (error) {
        throw error
    }
}

export const getComponentCodeList = async (
  params: ComponentCodeApi.listRequest,
): Promise<ComponentCodeApi.listResponse> => {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(
      filteredParams as Record<string, string>,
    ).toString()

    const response = await request(`/componentCode/list?${queryString}`, {
      method: "GET",
    })

    return await response.json()
  } catch (error) {
    throw error
  }
}

export const deleteComponentCode = async (
  params: ComponentCodeApi.deleteRequest,
): Promise<void> => {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(
      filteredParams as Record<string, string>,
    ).toString()

    await request(`/componentCode/delete?${queryString}`, {
      method: "DELETE",
    })

    return
  } catch (error) {
    // Error will be handled by request.ts
    throw error
  }
}

export const getComponentCodeDetail = async (
  params: ComponentCodeApi.detailRequest,
): Promise<ComponentCodeApi.detailResponse> => {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    )

    const queryString = new URLSearchParams(
      filteredParams as Record<string, string>,
    ).toString()

    const response = await request(`/componentCode/detail?${queryString}`, {
      method: "GET",
    })

    return await response.json()
  } catch (error) {
    throw error
  }
}

export const editComponentCode = async (
  params: ComponentCodeApi.editRequest,
): Promise<ComponentCodeApi.editResponse> => {
  try {
    const response = await request("/componentCode/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
    return response.body as ReadableStream
  } catch (error) {
    throw error
  }
}

export const initComponentCode = async (
  params: ComponentCodeApi.initRequest,
): Promise<ComponentCodeApi.initResponse> => {
  try {
    const response = await request("/componentCode/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
    return response.body as ReadableStream
  } catch (error) {
    throw error
  }
}

export const saveComponentCode = async (
  params: ComponentCodeApi.saveRequest,
): Promise<any> => {
  try {
    const response = await request("/componentCode/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
    return await response.json()
  } catch (error) {
    throw error
  }
}