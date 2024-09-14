const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db'); 

exports.register = (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [name], async (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }
    
        if (results.length > 0) {
            // Si le nom d'utilisateur existe déjà
            return res.render('register', {
                message: 'The name is already taken'
            });
        } 
    
        // Si le nom d'utilisateur n'est pas pris, vérifiez l'email
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Internal Server Error');
            }
    
            if (results.length > 0) {
                // Si l'email existe déjà
                return res.render('register', {
                    message: 'The email is already taken'
                });
            }
    
            // Vérifie si les mots de passe correspondent
            if (password !== confirmPassword) {
                return res.render('register', {
                    message: 'The passwords do not match'
                });
        }
        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', {username: name, email: email, password: hashedPassword }, (error, results) => {
            if(error){
                console.log(error);
            } else {
                return res.render('register', {
                    message: 'User registered'
                });
            }
        });

        });
    });
}
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        // Si aucun token n'est trouvé, l'utilisateur n'est pas connecté
        req.user = null;
        return next();
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            // Si le token est invalide, l'utilisateur n'est pas connecté
            req.user = null;
            return next();
        }

        // Si le token est valide, stocker les informations de l'utilisateur dans req.user
        req.user = decoded;
        next();
    });
};

exports.login = (req, res) => {
    const { name, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [name], (error, results) => {
        if (error) {
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.render('login', {
                message: 'Username or password is incorrect'
            });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            if (result) {
                // Utilisateur authentifié avec succès, créer un JWT unique pour cet utilisateur
                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    jwtSecret,
                    { expiresIn: '1h' } // Le token expire dans 1 heure
                );

                // Définir le cookie contenant le JWT
                res.cookie('jwt', token, { httpOnly: true, secure: true, maxAge: 3600000 });

                return res.redirect('/dashboard');
            } else {
                return res.render('login', {
                    message: 'Username or password is incorrect'
                });
            }
        });
    });
};