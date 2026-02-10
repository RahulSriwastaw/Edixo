import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3003", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Try to reload the page or open a new tab to navigate to a known URL for Creator mode or AI question generation interface.
        await page.goto('http://localhost:3003/creator', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Click on the 'Creator Studio' button to enter the AI question generation interface.
        frame = context.pages[-1]
        # Click on the 'Creator Studio' button to enter the AI question generation interface.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the 'Intelligence Lab' menu item on the left sidebar to access AI question generation interface.
        frame = context.pages[-1]
        # Click on 'Intelligence Lab' in the left sidebar to access AI question generation interface.
        elem = frame.locator('xpath=html/body/div/div/aside/nav/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid parameters for subject, difficulty level, language, and question type, then trigger AI question generation by clicking 'Initialize Synthesis'.
        frame = context.pages[-1]
        # Input '5' as the number of questions to generate
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div[2]/div/div/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('5')
        

        frame = context.pages[-1]
        # Click 'Initialize Synthesis' to trigger AI question generation
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Group stage matches of the ICC U19 Men\'s Cricket World Cup 2026 were played on January 18, 2026. Which two nations are co-hosting this edition of the tournament?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Global leaders gathered in Davos on January 18, 2026, for the Annual Meeting of the World Economic Forum (WEF) starting the next day. What is the official theme of the WEF 2026 Annual Meeting?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=On January 18, 2026, citizens of which European country went to the polls to elect a new President, as the incumbent Marcelo Rebelo de Sousa completed his term?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=On January 18, 2026, millions of devotees in India observed \'Mauni Amavasya\' by taking a holy dip in sacred rivers. This auspicious day falls in which month of the Hindu calendar?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=The main draw matches of the Australian Open 2026, the first Grand Slam tennis tournament of the year, commenced on January 18, 2026. In which city is this tournament held?').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    