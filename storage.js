// Gestion du stockage local des données
const Storage = {
    // Clés pour le localStorage
    KEYS: {
        CLIENTS: 'facturation_clients',
        FACTURES: 'facturation_factures',
        COUNTER: 'facturation_counter'
    },

    // Initialisation du stockage
    init() {
        if (!localStorage.getItem(this.KEYS.CLIENTS)) {
            localStorage.setItem(this.KEYS.CLIENTS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.FACTURES)) {
            localStorage.setItem(this.KEYS.FACTURES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.COUNTER)) {
            localStorage.setItem(this.KEYS.COUNTER, '1');
        }
    },

    // Gestion des clients
    getClients() {
        return JSON.parse(localStorage.getItem(this.KEYS.CLIENTS));
    },

    addClient(client) {
        const clients = this.getClients();
        clients.push(client);
        localStorage.setItem(this.KEYS.CLIENTS, JSON.stringify(clients));
    },

    updateClient(clientId, updatedClient) {
        const clients = this.getClients();
        const index = clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            clients[index] = updatedClient;
            localStorage.setItem(this.KEYS.CLIENTS, JSON.stringify(clients));
            return true;
        }
        return false;
    },

    deleteClient(clientId) {
        const clients = this.getClients();
        const newClients = clients.filter(c => c.id !== clientId);
        localStorage.setItem(this.KEYS.CLIENTS, JSON.stringify(newClients));
    },

    // Gestion des factures
    getFactures() {
        return JSON.parse(localStorage.getItem(this.KEYS.FACTURES));
    },

    addFacture(facture) {
        const factures = this.getFactures();
        facture.numero = this.getNextFactureNumber();
        factures.push(facture);
        localStorage.setItem(this.KEYS.FACTURES, JSON.stringify(factures));
        this.incrementFactureCounter();
    },

    updateFacture(factureId, updatedFacture) {
        const factures = this.getFactures();
        const index = factures.findIndex(f => f.id === factureId);
        if (index !== -1) {
            factures[index] = updatedFacture;
            localStorage.setItem(this.KEYS.FACTURES, JSON.stringify(factures));
            return true;
        }
        return false;
    },

    deleteFacture(factureId) {
        const factures = this.getFactures();
        const newFactures = factures.filter(f => f.id !== factureId);
        localStorage.setItem(this.KEYS.FACTURES, JSON.stringify(factures));
    },

    // Gestion du compteur de factures
    getNextFactureNumber() {
        return parseInt(localStorage.getItem(this.KEYS.COUNTER));
    },

    incrementFactureCounter() {
        const current = this.getNextFactureNumber();
        localStorage.setItem(this.KEYS.COUNTER, (current + 1).toString());
    }
};

// Initialiser le stockage au chargement
document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
}); 