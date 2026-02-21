from playwright.sync_api import sync_playwright
import time
import os

def run_intensive_audit():
    with sync_playwright() as p:
        # Simulate mobile device
        iphone = p.devices['iPhone 13']
        browser = p.chromium.launch(headless=True)
        
        # Scenario 1: Slow Network + High Latency
        context = browser.new_context(
            **iphone,
            locale='es-ES',
            timezone_id='Europe/Madrid'
        )
        page = context.new_page()
        
        # Emulate slow 3G (approximate)
        client = page.context.new_cdp_session(page)
        client.send("Network.emulateNetworkConditions", {
            "offline": False,
            "latency": 400,
            "downloadThroughput": 400 * 1024 / 8,
            "uploadThroughput": 200 * 1024 / 8
        })

        try:
            print("--- Scenario: Slow Mobile Network (Game Selection) ---")
            page.goto('https://adventure-forge.vercel.app')
            
            # 1. Loading State Audit
            # Capture early state to see if there's a flicker or empty screen
            time.sleep(1)
            page.screenshot(path='audit_loading_initial.png')
            
            # Wait for content
            page.wait_for_selector('button', timeout=60000)
            page.screenshot(path='audit_main_menu_mobile.png')
            
            # Check Hit Areas (Min 44px)
            buttons = page.query_selector_all('button')
            print(f"Detected {len(buttons)} buttons on Main Menu")
            for i, btn in enumerate(buttons):
                box = btn.bounding_box()
                if box:
                    is_small = box['width'] < 44 or box['height'] < 44
                    status = "SMALL! [X]" if is_small else "OK [V]"
                    print(f"Button {i} ({btn.inner_text().strip() or 'icon'}): {box['width']}x{box['height']} - {status}")

            # 2. Transition to Adventure Selection
            print("Clicking New Adventure...")
            # We look for something that looks like "New Adventure" or similar
            # Based on previous script, it might have data-testid="new-adventure-btn"
            new_adv = page.locator('[data-testid="new-adventure-btn"]')
            if new_adv.count() > 0:
                new_adv.click()
            else:
                # Fallback to text search if testid is missing in current version
                page.get_by_role("button", name="Nueva Aventura").click()

            page.wait_for_load_state('networkidle')
            time.sleep(2) # Animation buffer
            page.screenshot(path='audit_selection_screen_mobile.png')

            # 3. Intensive Carousel Check
            print("Testing Carousel Responsiveness...")
            next_btn = page.locator('.carousel-nav.next')
            if next_btn.count() > 0:
                for _ in range(3):
                    next_btn.click()
                    time.sleep(0.5)
                page.screenshot(path='audit_selection_rotated_mobile.png')

            # 4. Game Loop - Stressing the Typewriter/Overlay
            print("Starting Game Stress Test...")
            start_btn = page.locator('[data-testid="start-adventure-btn"]')
            if start_btn.count() > 0:
                start_btn.click()
            else:
                page.get_by_role("button", name="Empezar").click()

            # Wait for narrative
            print("Waiting for narrative stream...")
            # Let's wait for the typewriter or a text container
            time.sleep(10) # Heavy stream
            page.screenshot(path='audit_game_stream_mobile.png')
            
            # Check for text clipping in the overlay
            narrative = page.locator('.narrative-text')
            if narrative.count() > 0:
                box = narrative.bounding_box()
                print(f"Narrative Container Box: {box}")

        except Exception as e:
            print(f"ERROR: {e}")
            page.screenshot(path='audit_error_crash.png')
        finally:
            browser.close()

if __name__ == "__main__":
    run_intensive_audit()
