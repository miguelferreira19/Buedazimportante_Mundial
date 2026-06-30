export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-9 w-56 rounded-md" />
        <div className="skeleton h-4 w-72 rounded-md" />
      </div>
      <div className="skeleton h-52 rounded-xl" />
      <div className="space-y-px">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-md" />
        ))}
      </div>
    </div>
  );
}
