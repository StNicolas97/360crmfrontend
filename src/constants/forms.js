// Champs des formulaires hors tâches (clients, contacts, employés, pertes)
import { CLIENT_STATUSES } from "./task";

export const CLIENT_FIELDS = [
  { key: "prenom", label: "Prénom", type: "text", required: true, col: 6, autocomplete: "given-name" },
  { key: "nom", label: "Nom", type: "text", required: true, col: 6, autocomplete: "family-name" },
  { key: "entreprise", label: "Entreprise", type: "text", col: 12, autocomplete: "organization" },
  { key: "email", label: "Courriel", type: "email", col: 6, autocomplete: "email" },
  { key: "telephone", label: "Téléphone", type: "tel", required: true, col: 6, autocomplete: "tel" },
  { key: "adresse", label: "Adresse", type: "text", col: 12, autocomplete: "street-address" },
  { key: "statut", label: "Statut", type: "select", options: CLIENT_STATUSES, col: 6 },
];

export const CONTACT_FIELDS = [
  { key: "prenom", label: "Prénom", type: "text", col: 6 },
  { key: "nom", label: "Nom", type: "text", col: 6 },
  { key: "telephone", label: "Téléphone", type: "tel", required: true, col: 6 },
  { key: "email", label: "Courriel", type: "email", col: 6 },
  { key: "poste", label: "Poste", type: "text", col: 12 },
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

export const PERTE_FIELDS = [
  { key: "typeVinyle", label: "Type de vinyle", type: "text", required: true, col: 6 },
  { key: "typeLaminier", label: "Type de laminage", type: "text", col: 6 },
  { key: "dimensions", label: "Dimensions", type: "text", col: 6 },
  { key: "cout", label: "Coût ($)", type: "number", step: "0.01", min: 0, required: true, col: 6 },
  { key: "raison", label: "Raison", type: "textarea", col: 12 },
];

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
