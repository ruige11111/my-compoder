import { ComponentCode } from "@/lib/db/componentCode/types"
import { Prompt } from "@/lib/db/componentCode/types"

declare namespace ComponentCodeApi {

    export interface component {
      id: string
      name: string
      code: string
      prompt: Prompt[]
      isInitialized?: boolean
    }

    export interface listRequest {
        codegenId: string
        page: number
        pageSize: number
        searchKeyword?: string
        filterField?: "all" | "name" | "description"
    }

    export interface listResponse {
        data: Array<
          Pick<ComponentCode, "_id" | "name" | "description"> & {
            latestVersionCode: string
          }
        >
        total: number
    }

    export interface detailRequest {
      id: string
      codegenId: string
    }

    export interface detailResponse {
        data: Pick<ComponentCode, "_id" | "name" | "description" | "versions"> & {
          codeRendererUrl: string
        }
    }

    export interface createRequest {
        codegenId: string
        prompt: Prompt[]
        model: string
        provider: string
    }

    export interface deleteRequest {
      id: string
    }

    export interface editRequest {
      codegenId: string
      prompt: Prompt[]
      component: component
      model: string
      provider: string
    }

    export type editResponse = ReadableStream

    export interface initRequest {
      codegenId: string
      component: component
      prompt: Prompt[]
      model: string
      provider: string
    }

    export type initResponse = ReadableStream

    export interface saveRequest {
      id: string
      versionId: string
      code: string
    }

}