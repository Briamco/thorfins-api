import 'dotenv/config'
// @ts-ignore
import SibApiV3Sdk from 'sib-api-v3-sdk'


export const sendCode = async (email: string, code: number) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance
  const apiKey = defaultClient.authentications['api-key']
  apiKey.apiKey = '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'

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

  const sendSmtpEmail = {
    to: [{ email }],
    sender: { name: 'Thorfins', email: 'gbriam754@gmail.com' }, // puedes usar un correo verificado por Brevo
    subject: 'Verification Code',
    htmlContent: `
    <p>Your verification code:</p>
    <h1><strong>${code}</strong></h1>`
  }

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Correo enviado')
  } catch (error) {
    console.error('Error al enviar el correo:', error)
  }
}