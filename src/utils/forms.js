// Outils génériques pour les formulaires déclaratifs (voir constants/taskForms.js et constants/forms.js).
// Un champ = { key, label, type, required, min, ... }.

// Format de courriel accepté partout dans l'application (même règle que le backend : simple et permissive)
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value) => typeof value === "string" && EMAIL_PATTERN.test(value.trim());

// Tous les champs d'une liste de sections
export const allFields = (sections) => sections.flatMap((section) => section.fields);

// Objet vide pour un formulaire de création
export function emptyForm(sections, defaults = {}) {
  const form = {};
  for (const f of allFields(sections)) form[f.key] = f.type === "select" ? "" : null;
  return { ...form, ...defaults };
}

const isEmpty = (value) => value === null || value === undefined || value === "";

// Validation simple et cohérente pour tous les formulaires.
// Renvoie { champ: message } ; un objet vide signifie que le formulaire est valide.
export function validateForm(form, fields) {
  const errors = {};
  for (const f of fields) {
    const value = form[f.key];
    if (f.required && isEmpty(value)) {
      errors[f.key] = "Ce champ est obligatoire";
    } else if (f.type === "email" && !isEmpty(value) && !isEmail(value)) {
      errors[f.key] = "Courriel invalide";
    } else if (f.type === "number" && !isEmpty(value) && Number.isNaN(Number(value))) {
      errors[f.key] = "Valeur numérique attendue";
    } else if (f.type === "number" && f.min !== undefined && !isEmpty(value) && Number(value) < f.min) {
      errors[f.key] = `La valeur minimale est ${f.min}`;
    }
  }
  if (form.datedebut && form.datefin && form.datefin < form.datedebut) {
    errors.datefin = "La date de fin doit être après la date de début";
  }
  return errors;
}
