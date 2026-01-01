/** Adds multilne padding */
export function pad(text: string, padLen = 2) {
  const padding = Array.from({ length: padLen }, () => " ").join("");
  return text.replaceAll("\n", "\n" + padding);
}
