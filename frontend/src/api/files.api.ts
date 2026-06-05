import { apiClient } from "@/api/axios";
import type { FileUploadResponse } from "@/types/domain";
import { env } from "@/lib/env";

export const filesApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<FileUploadResponse>("/api/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
  absoluteUrl: (relativePath: string) =>
    relativePath.startsWith("http") ? relativePath : `${env.apiUrl}${relativePath}`,
};
