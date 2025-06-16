"use client"
import { useEffect, useState } from "react";
import LocalTournament from "./LocalTournament";
import OnlineTournament from "./OnlineTournament";
import { notFound, useSearchParams } from 'next/navigation';


// Main Component
export default function TournamentPage() {
 const searchParams = useSearchParams();
  const [gameMode, setGameMode] = useState<"Local" | "Online" | null>(null);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'Local' || modeParam === 'Online') {
      setGameMode(modeParam as "Local" | "Online");
    } else {
      notFound();
    }
  }, [searchParams]);

     return (
      <>
        {gameMode === 'Local' ? (
          <LocalTournament />
        ) : gameMode === 'Online' ? (
          <OnlineTournament />
        ) : null}
      </>
    )
}
