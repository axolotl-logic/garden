A browser emulation and test framework.

## Usage
### Screenshots 
   > Full page screenshot is a screenshot of a full scrollable page, as if you had a very tall screen and the page could fit it entirely. [^1]
```javascript
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

> Rather than writing into a file, you can get a buffer with the image and post-process it or pass it to a third party pixel diff facility.[^1]
```javascript
const buffer = await page.screenshot();  
console.log(buffer.toString('base64'));
```

> Sometimes it is useful to take a screenshot of a single element. [^1] 
```javascript
await page.locator('.header').**screenshot**({ path: 'screenshot.png' });
```


[^1]: https://playwright.dev/docs/screenshots
