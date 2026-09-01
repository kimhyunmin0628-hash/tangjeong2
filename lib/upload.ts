import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

/** 업로드된 File을 Vercel Blob의 {subdir} 경로 아래 저장하고 공개 URL을 반환 */
export async function saveUploadedFile(file: File, subdir: string) {
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const filename = `${Date.now()}-${randomUUID()}${ext}`;

  const blob = await put(`${subdir}/${filename}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

/** 이미지 Buffer를 Vercel Blob의 {subdir} 경로 아래 저장하고 공개 URL을 반환 */
export async function saveBuffer(data: Buffer, ext: string, subdir: string) {
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;

  const blob = await put(`${subdir}/${filename}`, data, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}
