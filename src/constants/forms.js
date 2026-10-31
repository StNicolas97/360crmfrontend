// Champs des formulaires hors tâches (clients, contacts, employés, pertes)
import { CLIENT_STATUSES } from "./task";

export const CLIENT_FIELDS = [
  // autocomplete="off" : ce sont les coordonnées d'un tiers. Sur une tablette partagée, le navigateur
  // proposerait sinon l'identité de l'employé connecté (son nom, son courriel, son adresse).
  { key: "prenom", label: "Prénom", type: "text", required: true, col: 6, autocomplete: "off" },
  { key: "nom", label: "Nom", type: "text", required: true, col: 6, autocomplete: "off" },
  { key: "entreprise", label: "Entreprise", type: "text", col: 12, autocomplete: "off" },
  { key: "email", label: "Courriel", type: "email", col: 6, autocomplete: "off" },
  { key: "telephone", label: "Téléphone", type: "tel", required: true, col: 6, autocomplete: "off" },
  { key: "adresse", label: "Adresse", type: "text", col: 12, autocomplete: "off" },
  { key: "statut", label: "Statut", type: "select", options: CLIENT_STATUSES, col: 6 },
];

export const CONTACT_FIELDS = [
  // Contact d'un client : même règle (pas de remplissage avec l'identité de l'employé)
  { key: "prenom", label: "Prénom", type: "text", col: 6, autocomplete: "off" },
  { key: "nom", label: "Nom", type: "text", col: 6, autocomplete: "off" },
  { key: "telephone", label: "Téléphone", type: "tel", required: true, col: 6, autocomplete: "off" },
  { key: "email", label: "Courriel", type: "email", col: 6, autocomplete: "off" },
  { key: "poste", label: "Poste", type: "text", col: 12, autocomplete: "off" },
];

export const ROLE_OPTIONS = [
  { value: "employee", label: "Employé" },
  { value: "admin", label: "Administrateur" },
];

export const USER_FIELDS = [
  { key: "prenom", label: "Prénom", type: "text", required: true, col: 6 },
  { key: "nom", label: "Nom", type: "text", required: true, col: 6 },
  { key: "username", label: "Nom d'utilisateur", type: "text", required: true, col: 6, autocomplete: "off" },
  { key: "role", label: "Rôle", type: "select", options: ROLE_OPTIONS, required: true, col: 6 },
  { key: "email", label: "Courriel", type: "email", col: 6 },
  { key: "telephone", label: "Téléphone", type: "tel", col: 6 },
  { key: "poste", label: "Poste", type: "text", col: 6 },
  { key: "couleur", label: "Couleur (calendrier)", type: "color", col: 6 },
];

export const PASSWORD_MIN_LENGTH = 8;

// Raisons fréquentes proposées en suggestions (la saisie libre reste possible)
export const PERTE_RAISONS = [
  "Erreur de découpe",
  "Erreur d'impression",
  "Défaut du matériau",
  "Erreur de pose",
  "Mauvaises mesures",
  "Retaille inutilisable",
];

// Champs de base d'une perte ; PerteFormModal y ajoute les suggestions tirées des pertes déjà saisies
// et le champ « Tâche liée ». « Raison » passe d'une zone de texte à une ligne avec suggestions
// (plus rapide au doigt) ; la valeur envoyée reste un texte libre.
export const PERTE_FIELDS = [
  { key: "typeVinyle", label: "Type de vinyle", type: "text", required: true, col: 6, autocomplete: "off", placeholder: "ex. 3M 2080 noir mat" },
  { key: "typeLaminier", label: "Type de laminage", type: "text", col: 6, autocomplete: "off" },
  { key: "dimensions", label: "Dimensions (po)", type: "text", col: 6, autocomplete: "off", placeholder: "ex. 60 x 120" },
  { key: "cout", label: "Coût ($)", type: "number", step: "0.01", min: 0, required: true, col: 6, inputmode: "decimal" },
  { key: "raison", label: "Raison", type: "text", col: 12, autocomplete: "off", suggestions: PERTE_RAISONS, hint: "Choisissez une raison fréquente ou écrivez la vôtre." },
];

// Ré-export pour compatibilité : la règle vit dans utils/forms.js
export { EMAIL_PATTERN } from "@/utils/forms";
