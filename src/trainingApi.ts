import type { Training } from "./types";

export function getTrainings(): Promise<{ _embedded: { trainings: Training[] } }> {
  return fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings")
    .then((res) => {
      if (!res.ok) throw new Error("Error when fetching trainings: " + res.statusText);
      return res.json();
    });
}

export function saveTraining(newTraining: {
  date: string;
  activity: string;
  duration: number;
  customer: string;
}) {
  return fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTraining),
  }).then((res) => {
    if (!res.ok) throw new Error("Error when adding a new training");
    return res.json();
  });
}

export function deleteTraining(url: string) {
  return fetch(url, { method: "DELETE" }).then((response) => {
    if (!response.ok) throw new Error("Error when deleting a training " + response.statusText);
    // palautetaan jotain, esim. true tai response.json() jos API palauttaa body
    return true;
  });
}
