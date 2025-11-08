export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-semibold">{message}</div>
      </div>
    </div>
  )
}

