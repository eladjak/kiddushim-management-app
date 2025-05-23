
import { PredefinedEvent } from "../types/eventTypes";
import { iyarEvents } from "./months/iyar";
import { sivanEvents } from "./months/sivan";
import { tammuzEvents } from "./months/tammuz";
import { avEvents } from "./months/av";
import { elulEvents } from "./months/elul";
import { tishreiEvents } from "./months/tishrei";
import { cheshvanEvents } from "./months/cheshvan";
import { tevetEvents } from "./months/tevet";
import { shvatEvents } from "./months/shvat";

/**
 * Events organized by Hebrew month for better management
 */
export const predefinedEventsByMonth: Record<string, PredefinedEvent[]> = {
  // Iyar (May) 5785 - 2025
  iyar: iyarEvents,
  
  // Sivan (June) 5785 - 2025
  sivan: sivanEvents,
  
  // Tammuz (July) 5785 - 2025
  tammuz: tammuzEvents,
  
  // Av (August) 5785 - 2025
  av: avEvents,
  
  // Elul (Sept) 5785 - 2025
  elul: elulEvents,
  
  // Tishrei (October) 5786 - 2025
  tishrei: tishreiEvents,
  
  // Cheshvan (November) 5786 - 2025
  cheshvan: cheshvanEvents,
  
  // Tevet (December) 5786 - 2025
  tevet: tevetEvents,
  
  // Tevet-Shvat (January) 5786 - 2026
  shvat: shvatEvents
};
