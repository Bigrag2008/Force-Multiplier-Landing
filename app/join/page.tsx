"use client";
import { useEffect, useState } from "react";
import { cleanCode } from "@/net/protocol";
import { JoinGame } from "@/ui/Online";

export default function JoinPage() {
  // the code from a shared link (?room=ABCD); read in the browser, after the page loads
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => setCode(cleanCode(new URLSearchParams(window.location.search).get("room") ?? "")), []); // eslint-disable-line react-hooks/set-state-in-effect
  if (code === null) return null;
  return <JoinGame initialCode={code} />;
}
