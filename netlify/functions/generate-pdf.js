import {cwd} from 'node:process'
import {executablePath} from '@sparticuz/chromium'
import {join} from 'node:path'
import {launch} from 'puppeteer-core'
export async function handler(event) {
  let puppeteerProcess
  try {
    const chromePath = await executablePath(`${join(cwd(), './node_modules/@sparticuz/chromium/bin/')}`)
    puppeteerProcess = await launch({
      args: [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--no-zygote',
        '--single-process'
      ],
      executablePath: chromePath,
      headless: false
    })
    const page = await puppeteerProcess.newPage()
    await page.goto('https://www.google.com/', {
      waitUntil: 'networkidle0'
    })
    const pdfBuffer = await page.pdf({
      displayHeaderFooter: true,
      format: 'A4',
      preferCSSPageSize: true
    })
    return {
      body: pdfBuffer.toString('base64'),
      headers: {
        'content-disposition': 'attachment;filename=file.pdf',
        'content-type': 'application/pdf'
      },
      isBase64Encoded: true,
      statusCode: 200
    }
  } catch (error) {
    console.error(error)
    return {
      body: JSON.stringify({
        error: 'Internal Server Error'
      }),
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 500
    }
  } finally {
    if (puppeteerProcess) {
      await puppeteerProcess.close()
    }
  }
}
