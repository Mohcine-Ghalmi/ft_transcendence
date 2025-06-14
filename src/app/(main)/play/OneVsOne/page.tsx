"use client"
import { useEffect, useState } from "react";
import Local1v1 from "./Locale";
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import OnlineMatch from "./Online";

export default function Page1v1() {
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
        <Local1v1 />
      ) : gameMode === 'Online' ? (
        <OnlineMatch />
      ) : null}
    </>
  );
}