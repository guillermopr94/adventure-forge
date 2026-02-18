from playwright.sync_api import sync_playwright
import time

def run_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # iPhone 12/13/14 Pro viewport
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        try:
            print("Navigating to app...")
            page.goto('http://localhost:3000')
            
            # Use data-testid if possible, falling back to text
            print("Waiting for main menu...")
            page.wait_for_selector('[data-testid="new-adventure-btn"]', timeout=60000)
            
            # 1. Main Menu Audit
            page.screenshot(path='ux_audit_mobile_main_menu.png')
            print("Main Menu screenshot saved.")
            
            # Click New Adventure
            print("Clicking New Adventure...")
            page.click('[data-testid="new-adventure-btn"]')
            
            # 2. Selection Screen Audit
            print("Waiting for selection screen...")
            page.wait_for_selector('[data-testid="start-adventure-btn"]', timeout=30000)
            print("Selection Screen loaded.")
            
            # Collect data for buttons
            navs = page.query_selector_all('.carousel-nav')
            print(f"NAVS_COUNT: {len(navs)}")
            for i, nav in enumerate(navs):
                box = nav.bounding_box()
                print(f"NAV_{i}: {box}")
                
            back = page.query_selector('.back-btn-absolute')
            if back:
                box = back.bounding_box()
                print(f"BACK_BTN: {box}")
                
            play_btn = page.query_selector('[data-testid="start-adventure-btn"]')
            if play_btn:
                box = play_btn.bounding_box()
                print(f"PLAY_BTN: {box}")
                
            # Check for overlapping elements or text cut-offs
            page.screenshot(path='ux_audit_mobile_selection.png')
            print("Selection Screen screenshot saved.")
            
            # Test carousel rotation
            print("Rotating carousel...")
            page.click('.carousel-nav.next')
            time.sleep(1) # wait for transition
            page.screenshot(path='ux_audit_mobile_selection_rotated.png')
            
            # 3. Game Screen Initial Load (Quick check)
            print("Starting game...")
            page.click('[data-testid="start-adventure-btn"]')
            # Give it some time to start generating
            time.sleep(8)
            page.screenshot(path='ux_audit_mobile_game_start.png')
            print("Game Start screenshot saved.")
            
        except Exception as e:
            print(f"ERROR: {e}")
            page.screenshot(path='ux_audit_error.png')
            print(f"Page Content on error: {page.content()[:1000]}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_audit()
