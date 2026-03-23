import 'dotenv/config';
import puppeteer from 'puppeteer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/v2/books/test';
const ITERATIONS = Number(process.env.ITERATIONS) || 20;
const URL_MANUAL = `${BASE_URL}/manual`;
const URL_NEST = `${BASE_URL}/nest`;

async function PerformanceTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let manualTotal = 0;
  let nestTotal = 0;

  console.log('Testing Manual Singleton...');

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    await page.goto(URL_MANUAL);

    const end = performance.now();
    manualTotal += end - start;
  }

  console.log('Testing Nest Service...');

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    await page.goto(URL_NEST);

    const end = performance.now();
    nestTotal += end - start;
  }

  console.log('\n--- RESULTS ---');
  console.log('Time - manual:', (manualTotal / ITERATIONS).toFixed(2), 'ms');
  console.log('Time - nest:', (nestTotal / ITERATIONS).toFixed(2), 'ms');

  await browser.close();
}

PerformanceTest();
