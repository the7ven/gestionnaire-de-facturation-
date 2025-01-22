  // Données de l'application
  let articles = [
    { id: 1, nom: "Pizza Margherita", prix: 12.50, categorie: "plat" },
    { id: 2, nom: "Coca-Cola", prix: 3.50, categorie: "boisson" }
];
let factures = [];
let panierCourant = [];

// Affichage des onglets
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Gestion des articles
function ajouterArticle() {
    const nom = document.getElementById('article-name').value;
    const prix = parseFloat(document.getElementById('article-price').value);
    const categorie = document.getElementById('article-category').value;

    if (!nom || !prix) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    const article = {
        id: articles.length + 1,
        nom,
        prix,
        categorie
    };

    articles.push(article);
    rafraichirTableArticles();
    
    // Réinitialiser le formulaire
    document.getElementById('article-name').value = '';
    document.getElementById('article-price').value = '';
}

// Gestion du panier
function ajouterAuPanier(articleId) {
    const article = articles.find(a => a.id === articleId);
    panierCourant.push(article);
    rafraichirPanier();
}

function retirerDuPanier(index) {
    panierCourant.splice(index, 1);
    rafraichirPanier();
}

function rafraichirPanier() {
    const container = document.getElementById('current-cart');
    container.innerHTML = '';

    panierCourant.forEach((article, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${article.nom} - ${article.prix.toFixed(2)} €</span>
            <button class="btn" onclick="retirerDuPanier(${index})">Retirer</button>
        `;
        container.appendChild(div);
    });

    const total = panierCourant.reduce((sum, article) => sum + article.prix, 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function finaliserFacture() {
    const tableNumber = document.getElementById('table-number').value;
    if (!tableNumber) {
        alert('Veuillez entrer un numéro de table');
        return;
    }

    if (panierCourant.length === 0) {
        alert('Le panier est vide');
        return;
    }

    const facture = {
        id: factures.length + 1,
        table: tableNumber,
        articles: [...panierCourant],
        date: new Date(),
        total: panierCourant.reduce((sum, article) => sum + article.prix, 0)
    };

    factures.push(facture);
    panierCourant = [];
    rafraichirPanier();
    rafraichirHistorique();
    alert('Facture finalisée !');
}

// Rafraîchissement des affichages
function rafraichirTableArticles() {
    const tbody = document.querySelector('#articles-table tbody');
    tbody.innerHTML = '';

    articles.forEach(article => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${article.nom}</td>
            <td>${article.prix.toFixed(2)} €</td>
            <td><button class="btn" onclick="ajouterAuPanier(${article.id})">Ajouter</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function rafraichirHistorique() {
    const tbody = document.querySelector('#historique-table tbody');
    tbody.innerHTML = '';

    factures.forEach(facture => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${facture.id}</td>
            <td>${facture.table}</td>
            <td>${moment(facture.date).format('DD/MM/YYYY HH:mm')}</td>
            <td>${facture.total.toFixed(2)} €</td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialisation
rafraichirTableArticles();
rafraichirHistorique();




