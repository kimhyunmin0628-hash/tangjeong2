import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMonthRange, formatMonthLabel } from "@/lib/constants";
import PhotoUploadForm from "./photo-upload-form";
import PhotoGrid from "./photo-grid";

export default async function PhotoMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;

  if (!getMonthRange().includes(month)) {
    notFound();
  }

  const [session, photos] = await Promise.all([
    auth(),
    prisma.photo.findMany({
      where: { month },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">
        {formatMonthLabel(month)} 현장사진
      </h1>
      <p className="mt-1 text-sm text-muted">총 {photos.length}장</p>

      {isAdmin && (
        <div className="mt-6">
          <PhotoUploadForm month={month} />
        </div>
      )}

      {photos.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          아직 등록된 사진이 없습니다.
        </p>
      ) : (
        <PhotoGrid
          photos={photos}
          monthLabel={formatMonthLabel(month)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
