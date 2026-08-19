// Detect whether CMS text is German or English so pages can set lang="de" and
// schema inLanguage correctly. The CMS stores no language field, so this is a
// stopword-frequency heuristic over title + excerpt; ties fall back to English
// (the site default). Marker lists use only unambiguous, high-frequency words.
const GERMAN_MARKERS = /\b(und|der|die|das|ein|eine|einen|für|mit|nicht|ist|sind|auch|werden|wird|oder|lassen|erstellen|kosten|website|webseite|warum|wie|was|bei|nach|über|damit|ihre|ihren|sie|man|mehr|ohne|zum|zur|auf|aus|wenn|dann|noch|nur|so|sehr|kann|können|sollte|sollten|gibt|es|im|am|vom|beim|dieser|diese|dieses|jetzt|hier|schon|zwischen|gegen|durch|unter|vor|seit|bis|als|aber|doch|denn|weil|dass|deshalb|dabei|dazu|davon|dafür)\b/gi;

const ENGLISH_MARKERS = /\b(the|and|for|with|not|is|are|also|will|or|let|create|cost|why|how|what|at|after|about|so that|your|you|one|more|without|to|from|on|out|if|then|still|only|very|can|could|should|there|it|in|this|these|that|now|here|already|between|against|through|under|before|since|until|as|but|because|therefore|thereby)\b/gi;

export type ContentLanguage = 'de' | 'en';

export function detectContentLanguage(text: string | null | undefined): ContentLanguage {
  if (!text) return 'en';

  const plain = text.replace(/<[^>]*>/g, ' ');
  const germanHits = plain.match(GERMAN_MARKERS)?.length ?? 0;
  const englishHits = plain.match(ENGLISH_MARKERS)?.length ?? 0;

  return germanHits > englishHits ? 'de' : 'en';
}
