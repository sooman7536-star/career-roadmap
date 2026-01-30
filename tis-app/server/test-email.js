const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'valentin.beier32@ethereal.email',
        pass: 'p8k4mXv113r7yX5w9u'
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP Connection Error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});
