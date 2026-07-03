import nodemailer from "nodemailer"
const sendEmail = async (options) => {
    try {
        let name = `${options.from}`;
        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: options.mail,
                pass: options.pass
            }
        })
        
        
        const mailoptions = ({
            from: `"StudiesForge" <${options.mail}>`,
            to: options.email,
            subject: options.subject,
            text: options.text
        })
        await transport.sendMail(mailoptions)
    } catch (error) {
        console.error(error)
    }
}

export default sendEmail