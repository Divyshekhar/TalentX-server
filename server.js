const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./controllers/db');
const sendMail = require('./controllers/mail.contact')
const sendMailSub = require('./controllers/mail.sub')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

    dotenv.config();


db.select('*').from('login').then(data => {
    console.log(data)
}
);

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json(database.users);
})

app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db('login').where('email', email).first() //getting user from database
        if (!user ) {
            return res.status(400).send("user doesn't exit") // if user does not exist
        }
        const isMatch = await bcrypt.compare(password, user.hash) // if user exist then comparing their password to the password that we got in user
        if (!isMatch) {
            return res.status(400).send("invalid password") //if the password is not correct
        }
        const token = jwt.sign({ userid: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json("token", token);

    }
    catch (err) {
        res.status(400).send("error signing in");
    }

});

app.post('/register', async (req, res) => {

    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);


        await db('login').insert({
            email: email,
            hash: hashedPassword

        }).then(console.log)
        const subject = "Welcome to Our Service!";
        const mailContent = `Hello ${name},\n\nThank you for registering with our service.\n\nBest regards,\nSnehil`;

        try {
            await sendMail('sinha.snehil2004@gmail.com', email, subject, mailContent);  // Replace with your sender email
            res.status(200).send("Registration successful and email sent");
        } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
            res.status(200).send("Registration successful, but failed to send email");
        }
    }
    catch (err) {
        res.status(400).send("error registering the user")
    }
});

app.post('/send-email-sub:id', async (req, res) => {
    const { name, email, message } = req.body;
    const { id } = req.params;
    const mailContent = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    try {
        await sendMailSub(email, 'sinha.snehil2004@gmail.com', id, mailContent);
        res.status(200).send("email send succesfully");
    }
    catch (err) {
        res.status(500).send("failed to send email");
    }
})

app.post('/send-email-contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    const mailContent = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    try {
        await sendMail(email, 'sinha.snehil2004@gmail.com', subject, mailContent);  // Replace with your email

    } catch (error) {
        res.status(500).json({ message: 'Failed to send email.' });
    }
});

function validToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(400).send("token missing")
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (e) {
        console.error("Token verification failed", e.message);
        res.status(400).send('invalid token');
    }
}

app.get('/userinfo', validToken, (req, res) => {
    res.json({ user: req.user });
})



app.listen(3000, () => {
    console.log(`port connected`)
})