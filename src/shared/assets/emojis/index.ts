// Re-export all emoji categories for backward compatibility
import { smileys_people } from "./smileys_people";
import { animals_nature } from "./animals_nature";
import { food_drink } from "./food_drink";
import { travel_places } from "./travel_places";
import { activities } from "./activities";
import { objects } from "./objects";
import { symbols } from "./symbols";
import { flags } from "./flags";

export {
  smileys_people,
  animals_nature,
  food_drink,
  travel_places,
  activities,
  objects,
  symbols,
  flags,
};

// Maintain the original emojis object structure for backward compatibility
export const emojis = {
  smileys_people,
  animals_nature,
  food_drink,
  travel_places,
  activities,
  objects,
  symbols,
  flags,
};
