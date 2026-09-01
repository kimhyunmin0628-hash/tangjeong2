import AdmZip from "adm-zip";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;

/** pptx 파일(zip) 안의 ppt/media/* 이미지를 파일명 순서대로 추출한다 */
export function extractPptxImages(buffer: Buffer): { ext: string; data: Buffer }[] {
  const zip = new AdmZip(buffer);
  const entries = zip
    .getEntries()
    .filter((e) => e.entryName.startsWith("ppt/media/") && IMAGE_EXT.test(e.entryName))
    .sort((a, b) => a.entryName.localeCompare(b.entryName, undefined, { numeric: true }));

  return entries.map((e) => ({
    ext: e.entryName.split(".").pop()!.toLowerCase(),
    data: e.getData(),
  }));
}
