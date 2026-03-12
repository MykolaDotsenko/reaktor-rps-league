interface Props {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/60 px-5 py-6">
      <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}