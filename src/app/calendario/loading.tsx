export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-44 rounded-xl" />
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} className="space-y-2.5">
          <div className="skeleton h-6 w-44 rounded-md" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-[5.5rem] rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
