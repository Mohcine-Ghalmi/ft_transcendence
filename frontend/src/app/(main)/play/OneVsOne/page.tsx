"use client"
import { useEffect, useState } from "react";
import Local1v1 from "./Locale";
import { notFound, useSearchParams } from 'next/navigation';
import OnlineMatch from "./Online";
import Matchmaking from "./Matchmaking";

export default function Page1v1() {
  const searchParams = useSearchParams();
  const [gameMode, setGameMode] = useState<"Local" | "Online" | null>(null);
  const [showMatchmaking, setShowMatchmaking] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const matchmakingParam = searchParams.get('matchmaking');
    
    if (modeParam === 'Local' || modeParam === 'Online') {
      setGameMode(modeParam as "Local" | "Online");
      if (matchmakingParam === 'true' && modeParam === 'Online') {
        setShowMatchmaking(true);
      } else {
        setShowMatchmaking(false);
      }
    } else {
      notFound();
    }
  }, [searchParams]);

  if (showMatchmaking) {
    return (
      <Matchmaking onBack={() => setShowMatchmaking(false)} />
    );
  }

  return (
    <>
      {gameMode === 'Local' ? (
        <Local1v1 />
      ) : gameMode === 'Online' ? (
        <OnlineMatch />
      ) : null}
    </>
  );
}