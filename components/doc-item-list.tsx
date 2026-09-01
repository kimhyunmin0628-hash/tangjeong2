import DocItem from "./doc-item";

interface Image {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

interface Item {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  images: Image[];
  tableData?: unknown;
}

export default function DocItemList({
  items,
  hideTitle,
}: {
  items: Item[];
  hideTitle?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        등록된 자료가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {items.map((item) => (
        <DocItem key={item.id} item={item} hideTitle={hideTitle} />
      ))}
    </div>
  );
}
