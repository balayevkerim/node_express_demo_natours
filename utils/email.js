const nodemailer = require('nodemailer');
const pug = require('pug');

const { htmlToText } = require('html-to-text');
//new Email(user,url).sendWelcome
class Email {
  constructor(user, url) {
    this.user = user;
    this.url = url;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `Balayev Karim <${process.env.EMAIL_FROM}>`;
  }

  createNewTransport() {
    if (process.env.NODE_ENV == 'production') {
      //sendgrid
      console.log('PRODDDDDD');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async send(template, emailSubject) {
    //send email

    //1) render html based on pug template
    let html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject: emailSubject,
    });

    //2) define email options
    const emailBody = {
      from: this.from,
      to: this.to,
      subject: emailSubject,
      html,
      text: htmlToText(html),
    };

    //3) create transport and send email

    await this.createNewTransport().sendMail(emailBody);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome ');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Reset Password, valid for 10 min');
  }
}

module.exports = Email;
