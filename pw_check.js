const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/techsim_initial.png' });

  const nodeItems = await page.locator('[draggable="true"]').all();
  console.log('Draggable nodes:', nodeItems.length);

  const cats = await page.locator('button span').filter({ hasText: /^(NETWORK|COMPUTE|DATA|MESSAGING|INFRASTRUCTURE|MONITORING)$/i }).allTextContents();
  console.log('Categories:', JSON.stringify(cats));

  const brand = await page.locator('header').innerText();
  console.log('Header:', brand.trim().substring(0, 100));

  const firstNode = nodeItems[0];
  const nb = await firstNode.boundingBox();
  const canvas = await page.locator('.react-flow__pane').boundingBox();
  
  if (nb && canvas) {
    await page.mouse.move(nb.x + nb.width/2, nb.y + nb.height/2);
    await page.mouse.down();
    const steps = 20;
    for(let i = 1; i <= steps; i++) {
      await page.mouse.move(
        nb.x + nb.width/2 + (canvas.x + canvas.width/2 - nb.x - nb.width/2)*i/steps,
        nb.y + nb.height/2 + (canvas.y + canvas.height/2 - nb.y - nb.height/2)*i/steps
      );
    }
    await page.mouse.up();
    await page.waitForTimeout(800);
    console.log('Drag done');
  }

  await page.screenshot({ path: '/tmp/techsim_dropped.png' });
  const canvasNodes = await page.locator('.react-flow__node').all();
  console.log('Canvas nodes after drop:', canvasNodes.length);
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
