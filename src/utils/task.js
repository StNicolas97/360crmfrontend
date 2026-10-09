import { typeKey, NOT_LATE_STATUSES, CLOSED_STATUS } from "@/constants/task";
import { daysFromToday, toISODate } from "./format";

// Les différentes routes de l'API renvoient des tâches de formes différentes :
//   /ppf, /lettrage, /affichage : id = id de la sous-tâche, idTache = id de la tâche
//   /tache/employe, /tache/client, /tache/all : id = id de la tâche, idPpf/idLett/idAff = sous-tâche
// normalizeTask ramène tout à une forme unique :
//   id = id de la tâche principale, subId = id de la sous-tâche, type = ppf|lettrage|affichage
export function normalizeTask(raw) {
  const id = raw.idTache ?? raw.id;
  const subId = raw.idPpf ?? raw.idLett ?? raw.idAff ?? (raw.idTache != null ? raw.id : null);
  return {
    ...raw,
    id,
    subId,
    type: typeKey(raw.typeTask),
    datedebut: toISODate(raw.datedebut),
    datefin: toISODate(raw.datefin),
    dateCommande: toISODate(raw.dateCommande),
    idAssigne: raw.idAssigne ?? raw.idemploye ?? raw.idEmp ?? null,
  };
}

// Supprime les doublons (une tâche peut revenir une fois par employé assigné)
export function uniqueTasks(tasks) {
  const seen = new Map();
  for (const task of tasks) if (!seen.has(task.id)) seen.set(task.id, task);
  return [...seen.values()];
}

export const isClosed = (task) => task.statut === CLOSED_STATUS;

export function isLate(task) {
  if (NOT_LATE_STATUSES.includes(task.statut)) return false;
  const days = daysFromToday(task.datefin);
  return days !== null && days < 0;
}

export function isDueToday(task) {
  return !isClosed(task) && (daysFromToday(task.datefin) === 0 || daysFromToday(task.datedebut) === 0);
}

export const isUrgent = (task) => task.priorite === "Urgent" && !isClosed(task);

// Route de la fiche d'une tâche
export function taskRoute(task) {
  return { name: "task-detail", params: { type: task.type, subId: task.subId } };
}
