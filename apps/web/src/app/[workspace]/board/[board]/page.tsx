"use client"

import { useParams } from "next/navigation";

interface BoardProps {
  params: Promise<{ workspace: string, board: string }>
}

export default function Board({
  params
}: BoardProps) {
  const { board: boardSlug } = useParams();

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <h1 className="text-2xl font-semibold">
          {boardSlug}
        </h1>
      </div>
    </>
  )
}