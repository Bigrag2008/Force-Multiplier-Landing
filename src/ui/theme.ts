import { C, type District } from "../engine/content";

export const DISTRICT_COLOR = C.districtColors;
export const LAYER_COLOR: Record<number, string> = { 1: "#E63946", 2: "#E0A526", 3: "#2F8FD8" };
export const LAYER_LABEL: Record<number, string> = { 1: "The cost", 2: "The clock", 3: "The connection" };
export const LEVER_WORD: Record<number, string> = { 1: "RED", 2: "AMBER", 3: "BLUE" };
export const titleCase = (d: District | string) => d.charAt(0) + d.slice(1).toLowerCase();
