import { describe, it, expect, vi, afterEach } from "vitest";
import { ref, nextTick } from "vue";
import { useTable } from "@/composables/useTable";
import { normalizeTask, uniqueTasks, isLate } from "@/utils/task";
import { formatDate, dueLabel, compareValues, toISODate } from "@/utils/format";
import { TASK_FORMS, allFields, emptyForm, validateForm } from "@/constants/taskForms";
import { typeKey } from "@/constants/task";

describe("normalizeTask", () => {
  it("lit une tâche renvoyée par /ppf (id = sous-tâche, idTache = tâche)", () => {
    const t = normalizeTask({ id: 7, idTache: 42, typeTask: "PPF", datefin: "2025-05-01T00:00:00.000Z" });
    expect(t).toMatchObject({ id: 42, subId: 7, type: "ppf", datefin: "2025-05-01" });
  });

  it("lit une tâche renvoyée par /tache/employe (id = tâche, idLett = sous-tâche)", () => {
    const t = normalizeTask({ id: 42, idLett: 9, idPpf: null, idAff: null, typeTask: "lettrage", idEmp: 3 });
    expect(t).toMatchObject({ id: 42, subId: 9, type: "lettrage", idAssigne: 3 });
  });

  it("supprime les doublons d'une tâche assignée à plusieurs employés", () => {
    expect(uniqueTasks([{ id: 1 }, { id: 1 }, { id: 2 }])).toHaveLength(2);
  });

  it("reconnaît les types quelle que soit la casse", () => {
    expect(typeKey("PPF")).toBe("ppf");
    expect(typeKey("Affichage")).toBe("affichage");
    expect(typeKey("soustraitance")).toBeNull();
  });
});

describe("dates", () => {
  afterEach(() => vi.useRealTimers());

  it("formate sans décalage de fuseau horaire", () => {
    expect(formatDate("2025-03-01")).toBe("01/03/2025");
    expect(formatDate(null)).toBe("—");
    expect(toISODate("2025-03-01T23:30:00.000Z")).toBe("2025-03-01");
  });

  it("calcule les retards par rapport à aujourd'hui", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T12:00:00"));
    expect(dueLabel("2025-06-10")).toBe("Aujourd'hui");
    expect(dueLabel("2025-06-12")).toBe("Dans 2 jours");
    expect(dueLabel("2025-06-07")).toBe("3 j de retard");
    expect(isLate({ datefin: "2025-06-07", statut: "Design" })).toBe(true);
    expect(isLate({ datefin: "2025-06-07", statut: "Termine" })).toBe(false);
    expect(isLate({ datefin: null, statut: "Design" })).toBe(false);
  });
});

describe("compareValues", () => {
  it("trie naturellement et place les valeurs vides en dernier", () => {
    const sorted = ["b10", null, "b2", "", "a"].sort(compareValues);
    expect(sorted).toEqual(["a", "b2", "b10", null, ""]);
  });
});

describe("useTable", () => {
  const rows = ref([
    { id: 1, nom: "Émile", statut: "Actif", score: 3 },
    { id: 2, nom: "anna", statut: "Inactif", score: 10 },
    { id: 3, nom: "Zoé", statut: "Actif", score: 1 },
  ]);

  it("recherche sans tenir compte des accents ni de la casse", () => {
    const table = useTable(rows, { search: ["nom"] });
    table.query.value = "emile";
    expect(table.rows.value.map((r) => r.id)).toEqual([1]);
  });

  it("filtre, trie et inverse le tri", () => {
    const table = useTable(rows, { filters: { statut: "" }, sort: { key: "score", dir: "asc" } });
    expect(table.rows.value.map((r) => r.id)).toEqual([3, 1, 2]);
    table.toggleSort("score");
    expect(table.rows.value.map((r) => r.id)).toEqual([2, 1, 3]);
    table.filters.statut = "Actif";
    expect(table.rows.value.map((r) => r.id)).toEqual([1, 3]);
  });

  it("pagine et revient à la page 1 après une recherche", async () => {
    const many = ref(Array.from({ length: 25 }, (_, i) => ({ id: i + 1, nom: `n${i}` })));
    const table = useTable(many, { search: ["nom"], pageSize: 10 });
    expect(table.pageCount.value).toBe(3);
    table.page.value = 3;
    expect(table.rows.value).toHaveLength(5);
    expect(table.range.value).toEqual({ from: 21, to: 25, total: 25 });
    table.query.value = "n1";
    await nextTick();
    expect(table.page.value).toBe(1);
  });
});

describe("formulaires de tâche", () => {
  it("exige les champs obligatoires", () => {
    const fields = allFields(TASK_FORMS.ppf);
    const errors = validateForm(emptyForm(TASK_FORMS.ppf), fields);
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(["titre", "idClient", "idAssigne"]));
  });

  it("refuse une date de fin avant la date de début et un prix négatif", () => {
    const fields = allFields(TASK_FORMS.lettrage);
    const errors = validateForm(
      { titre: "x", idClient: 1, idAssigne: 1, datedebut: "2025-05-10", datefin: "2025-05-01", prix: -5 },
      fields
    );
    expect(errors).toHaveProperty("datefin");
    expect(errors).toHaveProperty("prix");
  });

  it("ne demande ni découpe pour l'affichage ni quantité pour le lettrage", () => {
    expect(allFields(TASK_FORMS.affichage).map((f) => f.key)).not.toContain("decoupe");
    expect(allFields(TASK_FORMS.lettrage).map((f) => f.key)).not.toContain("quantite");
  });
});
