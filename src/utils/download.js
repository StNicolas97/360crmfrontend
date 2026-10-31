// Déclenche le téléchargement d'un contenu déjà récupéré (blob) sous un nom donné.
// On n'ouvre jamais le blob dans un onglet de l'origine du CRM : un fichier HTML ou SVG piégé
// s'y exécuterait avec accès au jeton. Le téléchargement forcé évite ce risque.
export function saveBlob(blob, filename = "fichier") {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Laisse au navigateur le temps de démarrer le téléchargement avant de libérer la mémoire
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// Avec responseType "blob", le corps d'une réponse d'erreur est aussi un blob :
// on le relit en JSON pour retrouver le message du serveur.
export async function readBlobError(error) {
  const body = error?.response?.data;
  if (typeof Blob === "undefined" || !(body instanceof Blob)) return error;
  try {
    error.response.data = JSON.parse(await body.text());
  } catch {
    // Corps non JSON : on garde l'erreur telle quelle (message générique)
  }
  return error;
}
