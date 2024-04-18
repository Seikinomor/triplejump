const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://worldathletics.org/news/discipline/long-jump');

  // Define a function to scroll to the bottom of the page and click the "LOAD MORE" button three times
  async function scrollAndTripleClickLoadMore() {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100; // Scroll distance
        const scrollInterval = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(scrollInterval);
            setTimeout(resolve, 1000); // Introduce a delay using setTimeout
          }
        }, 100); // Scroll interval
      });
    });

    // Click the "LOAD MORE" button three times with a delay between clicks
    for (let i = 0; i < 10; i++) {
      await page.click('.News_btnContainer__1-hrI button[data-name="loadMore-btn"]');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Introduce a delay between clicks
    }
  }

  // Scroll to load more content and triple click the button
  await scrollAndTripleClickLoadMore();

  // Extract data from the page
  const newsItems = await page.$$eval('.NewsItem_newsItem__20fNn', (items) =>
    items.map((item) => ({
      title: item.querySelector('.NewsItem_title__1OTus').innerText.trim(),
      date: item.querySelector('.NewsItem_date__3i2r5').innerText.trim(),
      text: item.querySelector('.NewsItem_text__inuHz').innerText.trim(),
      link: item.querySelector('.NewsItem_more__12Hc5 a').href,
      image: item.querySelector('.NewsItem_img__qF8CZ img').src,
    }))
  );

  // Write data to index.html
  fs.writeFileSync('index.html', generateHTML(newsItems), { encoding: 'utf-8' });

  console.log('Data saved to index.html.');

  await browser.close();
})();

// Function to generate HTML from data
function generateHTML(newsItems) {
  const itemsHTML = newsItems.map(item => `
    <div>
      <h3>${item.title}</h3>
      <p>Date: ${item.date}</p>
      <p>${item.text}</p>
      <a href="${item.link}">Read more</a>
      <img src="${item.image}" alt="${item.title}">
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>News Items</title>
    </head>
    <body>
      <h1>News Items</h1>
      ${itemsHTML}
    </body>
    </html>
  `;
}
