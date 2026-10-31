// Règles d'affichage liées aux droits (miroir des contrôles du backend, qui reste la seule vraie protection).
//   - modification d'une tâche : admin ou employé assigné
//   - suppressions (sous-traitance, contacts, fichiers, notes) : admin, ou auteur de l'élément si le backend
//     renvoie son identifiant (idUser / idAuteur / idAssigne selon la ressource)

export function canEditTask(auth, task) {
  if (!task) return false;
  if (auth.isAdmin) return true;
  const userId = auth.user?.id;
  return userId != null && Number(task.idAssigne) === Number(userId);
}

export function canDeleteOwned(auth, item) {
  if (auth.isAdmin) return true;
  const owner = item?.idUser ?? item?.idAuteur ?? item?.idAssigne ?? null;
  const userId = auth.user?.id;
  return owner != null && userId != null && Number(owner) === Number(userId);
}
