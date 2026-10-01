export const WORDS = {
  Food: ["Pizza", "Sushi", "Burger", "Pancakes", "Spaghetti", "Tacos", "Ice cream", "Chocolate", "Popcorn", "Jollof rice", "Sandwich", "Omelette", "Donut", "Curry", "Salad"],
  Animals: ["Elephant", "Penguin", "Giraffe", "Dolphin", "Kangaroo", "Owl", "Octopus", "Tiger", "Crocodile", "Rabbit", "Monkey", "Shark", "Horse", "Butterfly", "Bat"],
  Places: ["Airport", "Hospital", "Beach", "Library", "Cinema", "Zoo", "School", "Supermarket", "Church", "Gym", "Museum", "Stadium", "Prison", "Farm", "Casino"],
  Entertainment: ["Titanic", "Batman", "Harry Potter", "Football", "Karaoke", "Netflix", "Minecraft", "Guitar", "Magic show", "Circus", "Concert", "TikTok", "Cartoon", "Wrestling", "Talent show"],
  Objects: ["Umbrella", "Toothbrush", "Mirror", "Backpack", "Scissors", "Candle", "Remote control", "Pillow", "Wallet", "Ladder", "Headphones", "Clock", "Key", "Bicycle", "Suitcase"],
  Jobs: ["Doctor", "Pilot", "Chef", "Teacher", "Police officer", "Farmer", "Singer", "Firefighter", "Barber", "Lawyer", "Astronaut", "Plumber", "Photographer", "Driver", "Magician"],
};

export const MIXED = "Mixed";

export function pickWord(category, previous) {
  const pool = category === MIXED ? Object.values(WORDS).flat() : WORDS[category];
  let word;
  do {
    word = pool[Math.floor(Math.random() * pool.length)];
  } while (word === previous && pool.length > 1);
  return word;
}
