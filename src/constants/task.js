// Référentiel métier des tâches : une seule source pour les listes, badges et formulaires.

export const TASK_TYPES = {
  ppf: { key: "ppf", label: "PPF", endpoint: "ppf", typeTask: "PPF", icon: "bi-shield-check" },
  lettrage: { key: "lettrage", label: "Lettrage", endpoint: "lettrage", typeTask: "lettrage", icon: "bi-fonts" },
  affichage: { key: "affichage", label: "Affichage", endpoint: "affichage", typeTask: "affichage", icon: "bi-easel" },
};

export const TASK_TYPE_LIST = Object.values(TASK_TYPES);

// "PPF", "ppf", "Lettrage"... -> clé normalisée, ou null si inconnu
export function typeKey(typeTask) {
  const key = String(typeTask ?? "").toLowerCase();
  return TASK_TYPES[key] ? key : null;
}

export const CLOSED_STATUS = "Termine";
// Statuts pour lesquels une tâche n'est plus considérée en retard
export const NOT_LATE_STATUSES = ["Facturation", CLOSED_STATUS];

// Ordre du processus de production (colonnes du tableau)
export const STATUSES = [
  { value: "Leads", label: "Leads", color: "warning" },
  { value: "PPF", label: "PPF", color: "dark" },
  { value: "Design", label: "Design", color: "primary" },
  { value: "Approbation", label: "Approbation", color: "info" },
  { value: "Impression", label: "Impression", color: "secondary" },
  { value: "Production", label: "Production", color: "success" },
  { value: "Installation", label: "Installation", color: "dark" },
  { value: "Facturation", label: "Facturation", color: "danger" },
  { value: CLOSED_STATUS, label: "Terminé", color: "dark" },
];

export const PRIORITIES = [
  { value: "Urgent", label: "Urgent", color: "danger", icon: "bi-exclamation-triangle-fill" },
  { value: "Normal", label: "Normal", color: "success", icon: "bi-circle-fill" },
  { value: "Basse", label: "Basse", color: "info", icon: "bi-arrow-down-circle-fill" },
  ...["1", "2", "3", "4", "5"].map((n) => ({ value: n, label: n, color: "secondary", icon: "bi-circle" })),
];

export const CLIENT_STATUSES = [
  { value: "Actif", label: "Actif", color: "success" },
  { value: "Prospect", label: "Prospect", color: "info" },
  { value: "Inactif", label: "Inactif", color: "danger" },
];

const byValue = (list) => Object.fromEntries(list.map((item) => [item.value, item]));
export const STATUS_BY_VALUE = byValue(STATUSES);
export const PRIORITY_BY_VALUE = { ...byValue(PRIORITIES), Bas: byValue(PRIORITIES).Basse };
export const CLIENT_STATUS_BY_VALUE = byValue(CLIENT_STATUSES);

// Options propres aux formulaires
export const PPF_COUVERTURES = [
  { value: "Argent", label: "Kit Argent" },
  { value: "Argentp", label: "Kit Argent +" },
  { value: "Bronze", label: "Kit Bronze" },
  { value: "Custom", label: "Custom" },
  { value: "Entretien", label: "Entretien annuel" },
  { value: "Kit", label: "Kit de Van" },
  { value: "Nano", label: "Nano" },
  { value: "Or", label: "Kit Or" },
  { value: "Platinium", label: "Kit Platinium" },
  { value: "Réparation", label: "Réparation" },
  { value: "teintées", label: "Vitres teintées" },
];

export const PPF_PRODUITS = [
  { value: "Ultimate", label: "Xpel Ultimate Plus" },
  { value: "Stealth", label: "Xpel Stealth" },
  { value: "Fusion", label: "Xpel Fusion" },
  { value: "CS", label: "Xpel Prime CS Black" },
  { value: "XR", label: "Xpel Prime XR Black" },
];

export const PPF_FINANCEMENT = [
  { value: "Interessé", label: "Intéressé" },
  { value: "recu", label: "A reçu l'information" },
  { value: "Approuvé", label: "Approuvé" },
];

export const PPF_COURTOISIE = [
  { value: "Ford Fusion #2", label: "Ford Fusion #2" },
  { value: "Ford Fusion #3", label: "Ford Fusion #3" },
];

export const AFFICHAGE_MATERIELS = [
  { value: "coroplast", label: "Coroplast" },
  { value: "alupanel", label: "Alupanel" },
  { value: "pvc foam", label: "PVC Foam" },
  { value: "autre", label: "Autre" },
];

export const OUI_NON = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
];
