"use client";
import { useRouter } from "next/navigation";
import type { SessionConfig } from "@/game/session";
import { GameScreen } from "@/ui/GameScreen";

/** A first game with the Coach: three players, a head-start scenario, every rule explained as it comes up. */
const LEARN: SessionConfig = {
  mode: "coop",
  roster: [
    { name: "Simone", role: "Elder" },
    { name: "Nia", role: "Student" },
    { name: "Marcus", role: "Translator" },
  ],
  scenario: "The Audit",
  coach: true,
};

export default function LearnPage() {
  const router = useRouter();
  return <GameScreen config={LEARN} onQuit={() => router.push("/play")} />;
}
