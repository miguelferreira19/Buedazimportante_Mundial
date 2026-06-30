export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-5 w-28 rounded-md" />
      <div className="skeleton h-[5.5rem] rounded-lg" />
      <div className="skeleton h-7 w-60 rounded-md" />
      <div className="space-y-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-md" />
        ))}
      </div>
    </div>
  );
}
