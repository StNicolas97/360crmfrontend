// Définition déclarative des formulaires de tâche, par type.
// Utilisée par la création (TaskFormModal), la fiche (TaskDetailView) et la validation.
//
// Propriétés d'un champ :
//   key, label, type (text|number|date|time|select|textarea|client|contact|user),
//   options (select), col (largeur Bootstrap sur 12), required,
//   editOnly (absent à la création), adminOnly (lecture seule pour un employé),
//   lockOnEdit (modifiable par un employé à la création seulement),
//   clientKind ("person" | "company") pour le type client

import {
  STATUSES,
  PRIORITIES,
  PPF_COUVERTURES,
  PPF_PRODUITS,
  PPF_FINANCEMENT,
  PPF_COURTOISIE,
  AFFICHAGE_MATERIELS,
  OUI_NON,
} from "./task";

const field = {
  dateCommande: { key: "dateCommande", label: "Date commandée", type: "date", col: 12 },
  dateDebut: { key: "datedebut", label: "Date d'installation", type: "date", col: 7 },
  heureDebut: { key: "heuredebut", label: "Heure", type: "time", col: 5 },
  dateRamassage: { key: "datefin", label: "Date de ramassage prévue", type: "date", col: 7 },
  heureFin: { key: "heurefin", label: "Heure", type: "time", col: 5 },
  assignee: { key: "idAssigne", label: "Assigné à", type: "user", required: true, adminOnly: true, col: 6 },
  contact: { key: "idContact", label: "Contact", type: "contact", col: 6 },
  priorite: { key: "priorite", label: "Priorité", type: "select", options: PRIORITIES, col: 6 },
  statut: { key: "statut", label: "Statut", type: "select", options: STATUSES, col: 6, editOnly: true },
  prix: { key: "prix", label: "Prix avant taxes ($)", type: "number", step: "0.01", min: 0, col: 7 },
  notePrix: { key: "notePrix", label: "Note sur le prix", type: "text", col: 5 },
};

export const TASK_FORMS = {
  ppf: [
    {
      title: "Informations générales",
      fields: [
        { key: "titre", label: "Couverture choisie", type: "select", options: PPF_COUVERTURES, required: true, col: 12 },
        { key: "idClient", label: "Client", type: "client", clientKind: "person", required: true, lockOnEdit: true, col: 6 },
        field.assignee,
        field.dateCommande,
        field.dateDebut,
        field.heureDebut,
        field.dateRamassage,
        field.heureFin,
        field.priorite,
        field.statut,
      ],
    },
    {
      title: "Véhicule et produit",
      fields: [
        { key: "vehicule", label: "Véhicule (modèle / année)", type: "text", col: 12 },
        { key: "vin", label: "VIN #", type: "text", col: 6 },
        { key: "couleur", label: "Couleur", type: "text", col: 6 },
        { key: "produit", label: "Type de produit", type: "select", options: PPF_PRODUITS, col: 6 },
        { key: "vitre", label: "Teinte des vitres", type: "text", col: 6 },
        { key: "financement", label: "Financement", type: "select", options: PPF_FINANCEMENT, col: 6 },
        { key: "courtoisie", label: "Véhicule de courtoisie", type: "select", options: PPF_COURTOISIE, col: 6 },
        field.prix,
        field.notePrix,
        { key: "description", label: "Informations supplémentaires", type: "textarea", col: 12 },
      ],
    },
  ],

  lettrage: [
    {
      title: "Informations générales",
      fields: [
        { key: "titre", label: "Titre", type: "text", required: true, col: 12 },
        { key: "idClient", label: "Client", type: "client", clientKind: "company", required: true, lockOnEdit: true, col: 6 },
        field.contact,
        field.assignee,
        field.priorite,
        field.dateCommande,
        field.dateDebut,
        field.heureDebut,
        field.dateRamassage,
        field.heureFin,
        field.statut,
      ],
    },
    {
      title: "Détails du lettrage",
      fields: [
        { key: "modele", label: "Modèle", type: "text", col: 6 },
        { key: "annee", label: "Année", type: "number", min: 1900, max: 2100, col: 6 },
        { key: "specs", label: "Specs (toit / WB / boîte)", type: "text", col: 6 },
        { key: "couleur", label: "Couleur", type: "text", col: 6 },
        { key: "description", label: "Description", type: "textarea", col: 12 },
        { key: "typePapier", label: "Type de papier", type: "text", col: 6 },
        { key: "typeLaminage", label: "Type de laminage", type: "text", col: 6 },
        { key: "decoupe", label: "Découpe", type: "select", options: OUI_NON, col: 6 },
        { key: "imprimante", label: "Imprimante", type: "text", col: 6 },
        field.prix,
        field.notePrix,
      ],
    },
  ],

  affichage: [
    {
      title: "Informations générales",
      fields: [
        { key: "titre", label: "Titre", type: "text", required: true, col: 12 },
        { key: "idClient", label: "Client", type: "client", clientKind: "company", required: true, lockOnEdit: true, col: 6 },
        field.contact,
        { key: "description", label: "Description", type: "textarea", col: 12 },
        field.assignee,
        field.priorite,
        { ...field.dateCommande, col: 6 },
        { key: "datefin", label: "Date de livraison requise", type: "date", col: 6 },
        field.statut,
      ],
    },
    {
      title: "Détails de l'affichage",
      fields: [
        { key: "typeMateriel", label: "Type de matériel", type: "select", options: AFFICHAGE_MATERIELS, col: 6 },
        { key: "quantite", label: "Quantité", type: "number", min: 0, col: 6 },
        { key: "hauteur", label: "Hauteur (po)", type: "number", min: 0, step: "0.01", col: 6 },
        { key: "largeur", label: "Largeur (po)", type: "number", min: 0, step: "0.01", col: 6 },
        { key: "typePapier", label: "Type de papier", type: "text", col: 6 },
        { key: "typeLaminage", label: "Type de laminage", type: "text", col: 6 },
        { key: "imprimante", label: "Imprimante", type: "text", col: 6 },
        { key: "quantiteOeillet", label: "Œillets métalliques (qté)", type: "number", min: 0, col: 6 },
        field.prix,
        field.notePrix,
      ],
    },
  ],
};

export const SUBCONTRACT_FIELDS = [
  { key: "titre", label: "Titre", type: "text", required: true, col: 12 },
  { key: "sousTraitant", label: "Fournisseur / sous-traitant", type: "text", required: true, col: 6 },
  { key: "dateEnvoi", label: "Date d'envoi en production", type: "date", required: true, col: 6 },
  { key: "typePapier", label: "Type de produit", type: "text", col: 6 },
  { key: "quantite", label: "Quantité", type: "number", min: 0, col: 6 },
  { key: "largeur", label: "Largeur (po)", type: "number", min: 0, step: "0.01", col: 6 },
  { key: "hauteur", label: "Hauteur (po)", type: "number", min: 0, step: "0.01", col: 6 },
  { key: "prix", label: "Prix ($)", type: "number", min: 0, step: "0.01", col: 6 },
  { key: "description", label: "Description", type: "textarea", col: 12 },
];

export const NOTE_FIELDS = [
  { key: "commentaire", label: "Note (congé, rendez-vous, etc.)", type: "textarea", required: true, col: 12 },
  { key: "datedebut", label: "Début", type: "date", required: true, col: 6 },
  { key: "datefin", label: "Fin", type: "date", col: 6 },
];

export const allFields = (sections) => sections.flatMap((section) => section.fields);

// Objet vide pour un formulaire de création
export function emptyForm(sections, defaults = {}) {
  const form = {};
  for (const f of allFields(sections)) form[f.key] = f.type === "select" ? "" : null;
  return { ...form, ...defaults };
}

// Validation simple et cohérente pour tous les formulaires
export function validateForm(form, fields) {
  const errors = {};
  for (const f of fields) {
    const value = form[f.key];
    if (f.required && (value === null || value === undefined || value === "")) {
      errors[f.key] = "Ce champ est obligatoire";
    } else if (f.type === "number" && value !== null && value !== "" && Number.isNaN(Number(value))) {
      errors[f.key] = "Valeur numérique attendue";
    } else if (f.type === "number" && f.min !== undefined && value !== null && value !== "" && Number(value) < f.min) {
      errors[f.key] = `La valeur minimale est ${f.min}`;
    }
  }
  if (form.datedebut && form.datefin && form.datefin < form.datedebut) {
    errors.datefin = "La date de fin doit être après la date de début";
  }
  return errors;
}
