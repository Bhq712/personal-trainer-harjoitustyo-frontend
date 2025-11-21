import type { CustomerForm } from "./types";

export function getCustomers() {

    return fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers")
        .then(response => {
            if (!response.ok)
                throw new Error("Error when fetching customers: " + response.statusText);

        return response.json();
    })
}

export function deleteCustomer(url: string) {
    return fetch(url, { method: "DELETE"})
    .then(response => {
        if(!response.ok)
            throw new Error("Error when deleting a customer: " + response.statusText);

        response.json();
    })
}


export function saveCustomer(newCustomer: CustomerForm) {
    return fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers", {
        method: "POST",
        headers: { "Content-Type" : "application/json"},
        body: JSON.stringify(newCustomer)
    })
    .then(response => {
        if (!response.ok)
            throw new Error("Error when adding a new customer");

        return response.json();
    })     

}

export function editCustomer(url: string, updatedCustomer: CustomerForm) {
    return fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCustomer)
    })
        .then(response => {
            if (!response.ok)
                throw new Error("Error when editing a customer");
            return response.json();
});
}


