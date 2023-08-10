import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as process from 'process';

@Injectable()
export class CrawlingService {
  private logger = new Logger(CrawlingService.name);
  /**
   * @example
   * getBaseUrl('https://www.google.com/search-sample?name=jee', '.com') // https://www.google.com
   */
  getBaseUrl(url: string, topLevelDomain: string) {
    return url.split(topLevelDomain)[0] + topLevelDomain;
  }

  async launchBrowser(url: string) {
    this.logger.log(`Launch browser: ${url}`);

    const isProduction = process.env.NODE_ENV === 'production';

    const options = isProduction
      ? {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
          executablePath: '/usr/bin/chromium-browser',
          ignoreHTTPSErrors: true,
        }
      : {};

    const browser = await puppeteer.launch({
      headless: true,
      waitForInitialPage: true,
      ...options,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1024,
      height: 768,
    });

    await page.goto(url);

    return { browser, page };
  }
}
