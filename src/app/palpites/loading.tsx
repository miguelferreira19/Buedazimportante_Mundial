export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-44 rounded-xl" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-8 w-44 rounded-full" />
      </div>
      <div className="skeleton h-7 w-52 rounded-md" />
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-[6.5rem] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
