import { Guide } from "./Guide";

export const metadata = {
  title: "Teacher's guide — The Second Number",
  description: "One class period with The Second Number: learning goals, a 50-minute plan, and questions for after the game.",
};

/** the teacher's guide; the words are in Guide.tsx (a client component, so they follow the language switch) */
export default function Page() {
  return <Guide />;
}
