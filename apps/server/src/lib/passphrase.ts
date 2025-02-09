import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export function generatePassphrase(length = 4): string {
  const mn = generateMnemonic(wordlist);
  const words = mn.toLowerCase().split(" ");
  const passphrase = words.slice(0, length).join("-");
  return passphrase;
}
