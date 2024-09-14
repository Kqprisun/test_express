const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/image/'); // Le bon dossier est "public/image/"
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Renomme le fichier avec une date unique
    }
});


const image = multer({ storage: storage });

router.post('/dashboard/addGame', image.single('gameimage'), (req, res) => {
    if (!req.user || req.user.username !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { gamename, gamecreator } = req.body;
    let gameImage = req.file ? req.file.filename : 'default.png'; // Si pas d'image, utiliser une image par défaut

    // Insérer le nouveau jeu dans la base de données
    const sql = 'INSERT INTO games (title, creator, image) VALUES (?, ?, ?)';
    db.query(sql, [gamename, gamecreator, gameImage], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'ajout du jeu:', err);
            return res.redirect('/dashboard');
        }
        res.redirect('/gamelist');
    });
});
router.post('/deleteGame/:id', (req, res) => {
    if (!req.user || req.user.username !== 'admin') {
        return res.redirect('/gamelist');
    }

    const gameId = req.params.id;

    // Supprimer le jeu de la base de données
    const sql = 'DELETE FROM games WHERE id = ?';
    db.query(sql, [gameId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la suppression du jeu:', err);
            return res.redirect('/gamelist');
        }
        res.redirect('/gamelist');
    });
});

module.exports = router;
