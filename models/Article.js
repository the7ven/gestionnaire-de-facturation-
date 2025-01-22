const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prix: {
        type: Number,
        required: true
    },
    categorie: {
        type: String,
        required: true,
        enum: ['entree', 'plat', 'dessert', 'boisson']
    }
});

module.exports = mongoose.model('Article', articleSchema); 