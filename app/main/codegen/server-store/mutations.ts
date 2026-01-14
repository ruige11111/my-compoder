import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ComponentCodeApi } from "@/app/api/componentCode/type"
import {
  createComponentCode,
  deleteComponentCode,
  editComponentCode,
  initComponentCode,
  saveComponentCode,
} from "@/app/services/componentCode/componentCode.service"

export const useCreateComponentCode = () => {
  const { toast } = useToast()

  return useMutation<
    ComponentCodeApi.detailResponse,
    Error,
    ComponentCodeApi.createRequest
  >({
    mutationFn: params => createComponentCode(params),
    onError: error => {
      console.error("initComponentCode error", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

export const useDeleteComponentCode = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, Error, ComponentCodeApi.deleteRequest>({
    mutationFn: params => deleteComponentCode(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["componentCodeList"] })

      toast({
        title: "Success",
        description: "Component has been deleted successfully",
      })
    },
    onError: error => {
      console.error("deleteComponentCode error", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete component",
        variant: "destructive",
      })
    },
  })
}

export const useEditComponentCode = () => {
  return useMutation<
    ComponentCodeApi.editResponse,
    Error,
    ComponentCodeApi.editRequest
  >({
    mutationFn: params => editComponentCode(params),
  })
}

export const useInitComponentCode = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<
    ComponentCodeApi.initResponse,
    Error,
    ComponentCodeApi.initRequest
  >({
    mutationFn: params => initComponentCode(params),
    onSuccess: () => {
      // Invalidate the component list query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["componentCodeList"] })
    },
    onError: error => {
      console.error("createComponentCode error", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useSaveComponentCode = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation<any, Error, ComponentCodeApi.saveRequest>({
    mutationFn: params => saveComponentCode(params),
    onSuccess: () => {
      // Invalidate the component detail query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["componentCodeDetail"] })
    },
    onError: error => {
      console.error("saveComponentCode error", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}