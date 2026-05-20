Library to automate browser in [[NodeJS]]. 

## Usage

```typescript
import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';

// Launch the browser and open a new blank page
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Navigate the page to a URL.
await page.goto('https://developer.chrome.com/');

// Set screen size.
await page.setViewport({width: 1080, height: 1024});

// Type into search box.
await page.locator('.devsite-search-field').fill('automate beyond recorder');

// Wait and click on first result.
await page.locator('.devsite-result-item-link').click();

// Locate the full title with a unique string.
const textSelector = await page
  .locator('text/Customize and automate')
  .waitHandle();
const fullTitle = await textSelector?.evaluate(el => el.textContent);

// Print the full title.
console.log('The title of this blog post is "%s".', fullTitle);

await browser.close();
```

```typescript
// Create the browser instance. Pass an object to launch to configure the browser instance
const browser = await puppeteer.launch();

// Create a new page, and navigate to the example site when it's ready
const page = await browser.newPage();
await page.goto('https://example.com');

// Take a screenshot of the page and save it into the root folder (saves on creating folders)
await page.screenshot({ path: 'outputs/example.png' });

// Run code in the page context, here we return the viewing area and number of divs on the page
const pageData = await page.evaluate(() => {
	// Anything that you could normally run in a browser should be accessible here
	const divCount = document.querySelectorAll('div').length;
	
	return {
	  width: document.documentElement.clientWidth,
	  height: document.documentElement.clientHeight,
	  divCount,
	};
});

  // Print out the data from the page results. Make sure to do this OUTSIDE page.evaluate's context
  console.log(pageData);
  
await browser.close();

```
## Screenshot 

```typescript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://news.ycombinator.com', {
  waitUntil: 'networkidle2',
});
await page.screenshot({
  path: 'hn.png',
});

await browser.close();
```
## Locaters 

How to select and interact with an element. 

```typescript 
// 'button' is a CSS selector.
await page.locator('button').click();
```

```typescript 
// Locate the full title with a unique string.
const textSelector = await page
  .locator('text/Customize and automate')
  .waitHandle();
```

* Ensures the element is in the viewport.
* Waits for the element to become visible or hidden.
* Waits for the element to become enabled.
* Waits for the element to have a stable bounding box over two consecutive animation frames.
## Low Level Waiting

Use locators instead if possible for accessing elements

```typescript 
// Query for an element handle.
const element = await page.waitForSelector('div > .class-name');
```


