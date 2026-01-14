import { Codegen } from "@/lib/db/codegen/types"

declare namespace CodegenApi {
    export interface ListRequest {
        page: number
        pageSize: number
        name?: string
        fullStack?: "React" | "Vue"
    }

    export interface ListResponse {
        data: Pick<Codegen, "_id" | "title" | "description" | "fullStack">[]
        total: number
    }

    export interface DetailRequest {
        id: string
    }

    export interface DetailResponse {
        data: Pick<
          Codegen,
          | "_id"
          | "title"
          | "description"
          | "fullStack"
          | "guides"
          | "codeRendererUrl"
        >
    }
}