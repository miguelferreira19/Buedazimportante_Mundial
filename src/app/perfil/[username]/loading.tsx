export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-44 rounded-lg" />
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-[5rem] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
