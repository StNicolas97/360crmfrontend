// Fonctions de formatage partagées (dates, montants, noms)

// Date du jour au format AAAA-MM-JJ, dans le fuseau local
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "2025-03-14" ou ISO complet -> "AAAA-MM-JJ" (sans décalage de fuseau)
export function toISODate(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDate(value, fallback = "—") {
  const iso = toISODate(value);
  if (!iso) return fallback;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Nombre de jours entre aujourd'hui et la date (négatif = passé)
export function daysFromToday(value) {
  const iso = toISODate(value);
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date(`${todayISO()}T00:00:00`);
  return Math.round((target - today) / 86400000);
}

export function dueLabel(value) {
  const days = daysFromToday(value);
  if (days === null) return "Sans échéance";
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  if (days > 1) return `Dans ${days} jours`;
  return `${Math.abs(days)} j de retard`;
}

const money = new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" });
export function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? money.format(n) : "—";
}

export function fullName(person, fallback = "—") {
  if (!person) return fallback;
  const name = [person.prenom, person.nom].filter(Boolean).join(" ").trim();
  return name || fallback;
}

// Libellé d'un client : entreprise pour les tâches commerciales, personne sinon
export function clientLabel(client, preferCompany = true) {
  if (!client) return "—";
  if (preferCompany && client.entreprise) return client.entreprise;
  return fullName(client, client.entreprise || "—");
}

// Comparaison utilisée par tous les tris (vides en dernier, nombres et texte "naturels")
export function compareValues(a, b) {
  const emptyA = a === null || a === undefined || a === "";
  const emptyB = b === null || b === undefined || b === "";
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "fr", { numeric: true, sensitivity: "base" });
}

// Recherche insensible à la casse et aux accents
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
