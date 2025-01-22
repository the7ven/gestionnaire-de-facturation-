// Clés de stockage
const STORAGE_KEYS = {
    ARTICLES: 'restaurant_articles',
    FACTURES: 'restaurant_factures'
};

// Gestionnaire des articles
const ArticleStorage = {
    getAll() {
        const articles = localStorage.getItem(STORAGE_KEYS.ARTICLES);
        return articles ? JSON.parse(articles) : [];
    },

    add(article) {
        const articles = this.getAll();
        article.id = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
        articles.push(article);
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
        return article;
    },

    update(id, updatedArticle) {
        const articles = this.getAll();
        const index = articles.findIndex(a => a.id === id);
        if (index !== -1) {
            articles[index] = { ...articles[index], ...updatedArticle };
            localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
            return articles[index];
        }
        return null;
    },

    delete(id) {
        const articles = this.getAll();
        const filteredArticles = articles.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(filteredArticles));
    },

    getById(id) {
        const articles = this.getAll();
        return articles.find(a => a.id === id);
    }
};

// Gestionnaire des factures
const FactureStorage = {
    getAll() {
        const factures = localStorage.getItem(STORAGE_KEYS.FACTURES);
        return factures ? JSON.parse(factures) : [];
    },

    add(facture) {
        const factures = this.getAll();
        facture.id = factures.length > 0 ? Math.max(...factures.map(f => f.id)) + 1 : 1;
        facture.date_creation = new Date().toISOString();
        factures.push(facture);
        localStorage.setItem(STORAGE_KEYS.FACTURES, JSON.stringify(factures));
        return facture;
    },

    update(id, updatedFacture) {
        const factures = this.getAll();
        const index = factures.findIndex(f => f.id === id);
        if (index !== -1) {
            factures[index] = { ...factures[index], ...updatedFacture };
            localStorage.setItem(STORAGE_KEYS.FACTURES, JSON.stringify(factures));
            return factures[index];
        }
        return null;
    },

    delete(id) {
        const factures = this.getAll();
        const filteredFactures = factures.filter(f => f.id !== id);
        localStorage.setItem(STORAGE_KEYS.FACTURES, JSON.stringify(filteredFactures));
    },

    getById(id) {
        const factures = this.getAll();
        return factures.find(f => f.id === id);
    }
};

// Données initiales pour les articles (si vide)
function initializeDefaultData() {
    if (ArticleStorage.getAll().length === 0) {
        const defaultArticles = [
            { nom: 'Pizza Margherita', prix: 10.00, categorie: 'plat' },
            { nom: 'Salade César', prix: 8.50, categorie: 'entree' },
            { nom: 'Tiramisu', prix: 6.00, categorie: 'dessert' },
            { nom: 'Coca-Cola', prix: 3.00, categorie: 'boisson' }
        ];

        defaultArticles.forEach(article => ArticleStorage.add(article));
    }
}

// Initialiser les données par défaut
initializeDefaultData(); 