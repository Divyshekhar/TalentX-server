const nodemailer = require('nodemailer');
const sendMailSub = async (from, to, id, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sinha.snehil2004@gmail.com',
            pass: 'jlqx hqfb huid mshh'
        }
    });
    const mailOptions = {

        from: from,
        to: to,
        subject: "Subscription Needed"+id,
        text: text
    };
    try{
        const info = await transporter.sendMail(mailOptions);
        console.log("email sent" +info.response);
    }
    catch(err){
        console.error('error sending the email', err);
        throw(err);
    }


};
module.exports = sendMailSub;