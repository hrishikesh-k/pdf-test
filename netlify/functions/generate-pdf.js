import chromium from '@sparticuz/chromium';

const puppeteer = require('puppeteer-core');

exports.handler = async function (event) {
  console.log('generate-pdf called');
  const { url, fileName } = event.queryStringParameters;

  console.log('Launching browser');
  const browser = await puppeteer.launch({
    args: ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--no-zygote'],
    executablePath: await chromium.executablePath(),
    headless: false,
  });

  try {
    console.log('Browser launched successfully');
    const page = await browser.newPage();
    console.log('Page created successfully');
    console.log('url', url);
    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('Awaiting page load');
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.evaluate(() => {
      console.log('Page loaded');
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: `
      <div style='width: 9in; padding: 0 0.375in; position: relative;'>
        <div style="width: 100%; font-size: 8px; font-weight: 800; padding: 0.1in 0 0.08in 0.03in; border-top: 1px solid #6666667d; border-bottom: 1px solid #6666667d;">
          <a href="https://www.mofo.com/">
            <img
              src="data:image/png;base64,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"
              style="width: 120px;">
          </a>
        </div>
      <div>`,
      footerTemplate: `
    <div style='width: 8.5in; padding: 0 0.375in; position: relative;'>
      <div style='width: 100%; font-size: 8px; font-weight: 800; padding: 0.085in 0 0.25in 0; border-top: 1px solid #6666667d;'>
        © ${new Date().getFullYear()} Morrison & Foerster LLP. All Rights Reserved.
      </div>
    <div>
    `,
      preferCSSPageSize: true,
      margin: {
        top: 200,
        bottom: '40mm',
      },
    });
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName || test}.pdf`,
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.log('Error generating PDF', error);
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  } finally {
    await browser.close();
    console.log('Browser closed successfully');
    console.log('generate-pdf finished');
  }
};
