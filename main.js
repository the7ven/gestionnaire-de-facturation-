// Stockage local des articles et factures
let articles = JSON.parse(localStorage.getItem('articles')) || [];
let factures = JSON.parse(localStorage.getItem('factures')) || [];
let currentCart = [];

// Gestion des onglets
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    if (tabId === 'nouvelle-facture') {
        afficherArticlesDisponibles();
    } else if (tabId === 'historique') {
        afficherHistorique();
    }
}

// Fonction pour charger les articles depuis l'API
async function chargerArticles() {
    try {
        const response = await fetch('/api/articles');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
        return [];
    }
}

// Modifier la fonction d'affichage des articles
async function afficherArticlesDisponibles() {
    const tbody = document.querySelector('#articles-table tbody');
    tbody.innerHTML = '';
    
    const articles = await chargerArticles();

    articles.forEach(article => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${article.nom}</td>
            <td>${parseFloat(article.prix).toFixed(2)} €</td>
            <td>
                <div class="quantity-controls">
                    <button onclick="modifierQuantiteInput(${article.id}, -1)" class="btn-quantity">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" 
                           min="1" 
                           value="1" 
                           class="quantity-input" 
                           id="quantity-${article.id}"
                           onchange="validateQuantity(this)">
                    <button onclick="modifierQuantiteInput(${article.id}, 1)" class="btn-quantity">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="ajouterAuPanier(${article.id})" class="btn-add">
                        <i class="fas fa-cart-plus"></i>
                        Ajouter
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function validateQuantity(input) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
        input.value = 1;
    }
}

function modifierQuantiteInput(articleId, delta) {
    const input = document.getElementById(`quantity-${articleId}`);
    const currentValue = parseInt(input.value) || 1;
    const newValue = currentValue + delta;
    if (newValue >= 1) {
        input.value = newValue;
    }
}

// Modifier la fonction d'ajout au panier
async function ajouterAuPanier(articleId) {
    const articles = await chargerArticles();
    const article = articles.find(a => a.id === articleId);
    const quantityInput = document.getElementById(`quantity-${articleId}`);
    const quantity = parseInt(quantityInput.value) || 1;

    if (article) {
        // Debug: Afficher l'article trouvé
        console.log('Article trouvé:', article);

        // Vérifier si l'article existe déjà dans le panier
        const existingItem = currentCart.find(item => item.id === article.id);
        
        if (existingItem) {
            // Si l'article existe, augmenter la quantité
            existingItem.quantite += quantity;
            existingItem.total = existingItem.quantite * parseFloat(article.prix);
            console.log('Article existant mis à jour:', existingItem);
        } else {
            // Sinon, ajouter le nouvel article avec sa quantité
            const newItem = {
                id: article.id,
                nom: article.nom,
                prix: parseFloat(article.prix),
                quantite: quantity,
                total: quantity * parseFloat(article.prix)
            };
            console.log('Nouvel article ajouté:', newItem);
            currentCart.push(newItem);
        }
        
        // Réinitialiser l'input de quantité
        quantityInput.value = 1;
        afficherPanier();
    }
}

// Modifier l'affichage du panier
function afficherPanier() {
    const cartDiv = document.getElementById('current-cart');
    cartDiv.style.opacity = '0';
    
    setTimeout(() => {
        cartDiv.innerHTML = '';
        let total = 0;

        if (currentCart.length === 0) {
            cartDiv.innerHTML = `
                <div class="cart-empty">
                    <p>Aucun article dans le panier</p>
                </div>
            `;
        } else {
            currentCart.forEach((article, index) => {
                const sousTotal = article.prix * article.quantite;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-details">
                        <div class="cart-item-name">${article.nom}</div>
                        <div class="cart-item-price">
                            <span class="price-unit">${article.prix.toFixed(2)} €/unité</span>
                            <span class="price-total">Total: ${sousTotal.toFixed(2)} €</span>
                        </div>
                    </div>
                    <div class="cart-item-quantity">
                        <button onclick="modifierQuantite(${index}, -1)" class="btn btn-quantity">-</button>
                        <span class="quantity-display">${article.quantite}</span>
                        <button onclick="modifierQuantite(${index}, 1)" class="btn btn-quantity">+</button>
                    </div>
                    <button onclick="retirerDuPanier(${index})" class="btn btn-remove">
                        <span class="remove-icon">×</span>
                    </button>
                `;
                cartDiv.appendChild(div);
                total += sousTotal;
            });
        }

        document.getElementById('cart-total').textContent = total.toFixed(2);
        
        // À la fin de la fonction, rendre visible avec une transition
        cartDiv.style.opacity = '1';
    }, 50);
}

// Ajouter une fonction pour modifier la quantité
function modifierQuantite(index, delta) {
    const article = currentCart[index];
    const nouvelleQuantite = article.quantite + delta;
    
    if (nouvelleQuantite > 0) {
        article.quantite = nouvelleQuantite;
        article.total = article.quantite * article.prix;
        afficherPanier();
    } else if (nouvelleQuantite === 0) {
        retirerDuPanier(index);
    }
}

function retirerDuPanier(index) {
    const cartItems = document.querySelectorAll('.cart-item');
    const itemToRemove = cartItems[index];
    
    // Ajouter la classe d'animation
    itemToRemove.classList.add('removing');
    
    // Attendre la fin de l'animation avant de supprimer
    setTimeout(() => {
        currentCart.splice(index, 1);
        afficherPanier();
    }, 300); // Correspond à la durée de l'animation
}

// Modifier la fonction de finalisation de facture
async function finaliserFacture() {
    const tableNumber = document.getElementById('table-number').value;
    
    // Vérification des champs requis
    if (!tableNumber || currentCart.length === 0) {
        showErrorToast('Veuillez remplir le numéro de table et ajouter des articles');
        return;
    }

    try {
        // Debug: Afficher le panier actuel
        console.log('Contenu du panier:', currentCart);

        // Calculer le total
        const total = currentCart.reduce((sum, article) => sum + (article.prix * article.quantite), 0);

        // Formater les articles correctement
        const articlesFormatted = currentCart.map(article => {
            console.log('Article avant formatage:', article);
            
            const articleFormatted = {
                article_id: parseInt(article.id),
                quantite: parseInt(article.quantite),
                prix_unitaire: parseFloat(article.prix)
            };
            
            console.log('Article après formatage:', articleFormatted);
            return articleFormatted;
        });

        const factureData = {
            numeroTable: parseInt(tableNumber),
            articles: articlesFormatted,
            total: parseFloat(total.toFixed(2))
        };

        console.log('Données complètes de la facture:', factureData);

        const response = await fetch('/api/factures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(factureData)
        });

        const responseData = await response.json();
        console.log('Réponse du serveur:', responseData);

        if (!response.ok) {
            throw new Error(responseData.message || 'Erreur lors de la création de la facture');
        }

        // Réinitialiser le panier
        currentCart = [];
        document.getElementById('table-number').value = '';
        afficherPanier();
        
        // Notification de succès
        showSuccessToast('Facture finalisée avec succès!');
        
        // Rafraîchir l'historique
        afficherHistorique();
    } catch (error) {
        console.error('Erreur:', error);
        showErrorToast(error.message || 'Erreur lors de la finalisation de la facture');
    }
}

// Affichage de l'historique
async function afficherHistorique() {
    try {
        const response = await fetch('/api/factures');
        const factures = await response.json();
        
    const tbody = document.querySelector('#historique-table tbody');
    tbody.innerHTML = '';

    factures.forEach(facture => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${facture.id}</td>
                <td>${facture.numero_table}</td>
                <td>${moment(facture.date_creation).format('DD/MM/YYYY HH:mm')}</td>
                <td>${parseFloat(facture.total).toFixed(2)} €</td>
                <td>
                    <button onclick="voirDetailsFacture(${facture.id})" class="btn">Détails</button>
                </td>
        `;
        tbody.appendChild(tr);
    });
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        showErrorToast('Erreur lors du chargement de l\'historique');
    }
}

async function voirDetailsFacture(factureId) {
    try {
        const response = await fetch(`/api/factures/${factureId}`);
        const facture = await response.json();

        const articles = facture.articles || facture.articles_details || [];
        
        let content = `
            <div class="facture-details">
                <div class="facture-header">
                    <h2>Facture #${facture.id}</h2>
                    <p>Restaurant Babana</p>
                </div>
                <div class="facture-info">
                    <p><strong>Table N°:</strong> ${facture.numero_table}</p>
                    <p><strong>Date:</strong> ${moment(facture.date_creation).format('DD/MM/YYYY à HH:mm')}</p>
                </div>
                <table class="facture-articles">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Article</th>
                            <th style="text-align: center;">Quantité</th>
                            <th style="text-align: right;">Prix unitaire</th>
                            <th style="text-align: right;">Sous-total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (articles && articles.length > 0) {
            articles.forEach(article => {
                const prix = parseFloat(article.prix_unitaire || article.prix);
                const quantite = parseInt(article.quantite);
                const sousTotal = prix * quantite;
                
                content += `
                    <tr>
                        <td style="text-align: left;">${article.nom}</td>
                        <td style="text-align: center;">${quantite}</td>
                        <td style="text-align: right;">${prix.toFixed(2)} €</td>
                        <td style="text-align: right;">${sousTotal.toFixed(2)} €</td>
                    </tr>
                `;
            });
        } else {
            content += `
                <tr>
                    <td colspan="4" style="text-align: center;">Aucun article trouvé</td>
                </tr>
            `;
        }

        content += `
                    </tbody>
                </table>
                <div class="facture-total">
                    Total à payer: ${parseFloat(facture.total).toFixed(2)} €
                </div>
            </div>
        `;

        showModal(content);
    } catch (error) {
        console.error('Erreur:', error);
        Toastify({
            text: "Erreur lors de la récupération des détails de la facture",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b"
            }
        }).showToast();
    }
}

// Améliorer la fonction showModal
function showModal(content) {
    const modal = document.getElementById('factureModal');
    const modalContent = document.getElementById('modalContent');
    
    // Nettoyer le contenu précédent
    modalContent.innerHTML = '';
    
    // Ajouter le nouveau contenu
    modalContent.innerHTML = content;
    
    // Afficher le modal avec une animation
    modal.style.display = 'block';
    
    // Gérer la fermeture
    const span = document.getElementsByClassName('close')[0];
    span.onclick = () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
        }, 300);
    };
    
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.opacity = '1';
            }, 300);
        }
    };
}

// Charger les articles au démarrage
document.addEventListener('DOMContentLoaded', () => {
    afficherArticlesDisponibles();
});

// Au début du fichier main.js, après la déclaration des variables
async function ajouterArticle() {
    const nom = document.getElementById('article-name').value;
    const prix = parseFloat(document.getElementById('article-price').value);
    const categorie = document.getElementById('article-category').value;

    if (!nom || !prix || !categorie) {
        Toastify({
            text: "Veuillez remplir tous les champs",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b"
            }
        }).showToast();
        return;
    }

    try {
        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nom, prix, categorie })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout de l\'article');
        }

        const nouvelArticle = await response.json();
        console.log('Article ajouté:', nouvelArticle);

        // Réinitialiser le formulaire
        document.getElementById('article-name').value = '';
        document.getElementById('article-price').value = '';
        
        // Rafraîchir la liste des articles si on est sur l'onglet nouvelle facture
        if (document.querySelector('#nouvelle-facture').classList.contains('active')) {
            afficherArticlesDisponibles();
        }

        Toastify({
            text: "Article ajouté avec succès!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#51cf66"
            }
        }).showToast();
    } catch (error) {
        console.error('Erreur:', error);
        Toastify({
            text: "Erreur lors de l'ajout de l'article",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b"
            }
        }).showToast();
    }
}

// Modifier la fonction finaliserFacture pour utiliser Toastify
function showSuccessToast(message) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "#51cf66"
        }
    }).showToast();
}

// Pour les erreurs
function showErrorToast(message) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "#ff6b6b"
        }
    }).showToast();
}


