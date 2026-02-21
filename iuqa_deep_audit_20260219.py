"""
IUQA Deep Audit - Adventure Forge
Protocol: Intensive UX & QA Audit
Date: 2026-02-19 (Second Run - Fresh Capture)
Scope: Game Loop + Mobile UX + Visual Quality
"""
from playwright.sync_api import sync_playwright
import time
import json

PROD_URL = "https://adventure-forge.vercel.app"
OUT_DIR = "audit_v2_"

findings = []

def capture(page, name, note=""):
    path = f"{OUT_DIR}{name}.png"
    page.screenshot(path=path, full_page=False)
    print(f"[SCREENSHOT] {path} — {note}")
    return path

def check_hit_areas(page, context_label):
    """Audit all interactive elements for minimum 44px touch targets."""
    results = []
    elements = page.query_selector_all('button, a, [role="button"], input[type="checkbox"], input[type="radio"]')
    small_count = 0
    for el in elements:
        box = el.bounding_box()
        if box:
            is_small = box['width'] < 44 or box['height'] < 44
            if is_small:
                small_count += 1
                text = (el.inner_text() or "").strip()[:30]
                results.append({
                    "context": context_label,
                    "element": text or "[icon/no-text]",
                    "size": f"{box['width']:.0f}x{box['height']:.0f}px",
                    "issue": "BELOW 44px"
                })
    print(f"[HIT-AREA] {context_label}: {len(elements)} elements, {small_count} too small")
    return results

def check_text_overflow(page, context_label):
    """Detect text containers that might be clipping content."""
    overflow_els = page.evaluate("""
        () => {
            const issues = [];
            document.querySelectorAll('p, h1, h2, h3, span, button, a').forEach(el => {
                if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
                    issues.push({
                        tag: el.tagName,
                        text: el.innerText?.substring(0, 40) || '',
                        scrollW: el.scrollWidth,
                        clientW: el.clientWidth,
                        scrollH: el.scrollHeight,
                        clientH: el.clientHeight
                    });
                }
            });
            return issues.slice(0, 10); // top 10
        }
    """)
    if overflow_els:
        print(f"[OVERFLOW] {context_label}: {len(overflow_els)} elements with text overflow")
        for item in overflow_els[:5]:
            print(f"  → <{item['tag']}> '{item['text']}' scroll={item['scrollW']}x{item['scrollH']} client={item['clientW']}x{item['clientH']}")
    return overflow_els

def check_color_contrast(page):
    """Check if any text elements have potentially low contrast."""
    contrast_data = page.evaluate("""
        () => {
            const issues = [];
            const textEls = document.querySelectorAll('p, h1, h2, h3, button, span, a, label');
            textEls.forEach(el => {
                const style = window.getComputedStyle(el);
                const color = style.color;
                const bg = style.backgroundColor;
                // Flag rgba(255,255,255) on rgba(255,255,255) or transparent/near-transparent
                if (color && bg && color === bg) {
                    issues.push({ text: el.innerText?.substring(0, 30), color, bg });
                }
            });
            return issues.slice(0, 5);
        }
    """)
    return contrast_data

def check_loading_states(page, context_label):
    """Check for spinner/skeleton presence."""
    spinners = page.query_selector_all('[class*="spinner"], [class*="skeleton"], [class*="loading"], [role="progressbar"], [aria-busy="true"]')
    print(f"[LOADING-STATE] {context_label}: {len(spinners)} loader elements visible")
    return len(spinners)

def get_click_depth(steps):
    """Compute total steps to reach the game."""
    print(f"[CLICK-DEPTH] Steps to reach gameplay: {steps}")
    findings.append({
        "id": "UX-CD-001",
        "severity": "P2" if steps <= 4 else "P1",
        "type": "UX",
        "title": f"Click depth to gameplay: {steps} steps",
        "detail": f"User needs {steps} interactions to reach active gameplay. Recommended: ≤3 for mobile.",
        "screen": "Full Flow"
    })

def run_audit():
    with sync_playwright() as p:
        # =========================================================
        # SESSION 1: iPhone 13 (375x812) — Slow Network
        # =========================================================
        iphone = p.devices['iPhone 13']
        browser = p.chromium.launch(headless=True)
        
        context = browser.new_context(
            **iphone,
            locale='es-ES',
            timezone_id='Europe/Madrid'
        )
        page = context.new_page()
        
        # Slow 3G simulation
        cdp = page.context.new_cdp_session(page)
        cdp.send("Network.emulateNetworkConditions", {
            "offline": False,
            "latency": 500,
            "downloadThroughput": 300 * 1024 / 8,
            "uploadThroughput": 150 * 1024 / 8
        })
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append({"type": msg.type, "text": msg.text}) if msg.type in ["error", "warning"] else None)

        print("\n=== PASS 1: MAIN MENU (iPhone 13, Slow 3G) ===")
        page.goto(PROD_URL, wait_until="commit")
        
        # T+1s: Capture early loading state
        time.sleep(1)
        capture(page, "01_loading_t1s", "T+1s loading state")
        spinners_initial = check_loading_states(page, "T+1s Loading")
        
        # Wait for main content
        try:
            page.wait_for_selector('button', timeout=30000)
            page.wait_for_load_state('networkidle', timeout=30000)
        except Exception as e:
            print(f"[TIMEOUT] Main load: {e}")
        
        capture(page, "02_main_menu", "Main menu loaded")
        hit_issues = check_hit_areas(page, "Main Menu")
        overflow_main = check_text_overflow(page, "Main Menu")
        spinners_menu = check_loading_states(page, "Main Menu Loaded")
        
        # =========================================================
        # AUDIT: Header/Navigation presence on mobile
        # =========================================================
        header = page.query_selector('header, nav, [role="navigation"]')
        print(f"[NAV] Header/Nav present: {'YES' if header else 'NO'}")
        
        # =========================================================
        # AUDIT: Language selector / user menu visibility
        # =========================================================
        user_elements = page.query_selector_all('[data-testid*="user"], [data-testid*="auth"], [class*="user"], [class*="avatar"], [class*="profile"]')
        print(f"[AUTH-UI] User/auth UI elements: {len(user_elements)}")
        
        # =========================================================
        # PASS 2: ADVENTURE SELECTION
        # =========================================================
        print("\n=== PASS 2: ADVENTURE SELECTION ===")
        click_steps = 0
        
        # Try to navigate to adventure selection
        try:
            new_adv_btn = page.locator('[data-testid="new-adventure-btn"]')
            if new_adv_btn.count() > 0:
                new_adv_btn.click()
                click_steps += 1
            else:
                # Fallback selectors
                for selector in ['button:has-text("Nueva")', 'button:has-text("New")', 'button:has-text("Aventura")', 'button:has-text("Adventure")']:
                    btn = page.locator(selector)
                    if btn.count() > 0:
                        btn.first.click()
                        click_steps += 1
                        break
            
            time.sleep(2)
            page.wait_for_load_state('networkidle', timeout=15000)
            capture(page, "03_adventure_selection", "Adventure selection screen")
            hit_issues += check_hit_areas(page, "Adventure Selection")
            overflow_selection = check_text_overflow(page, "Adventure Selection")
            
            # Carousel navigation test
            print("[CAROUSEL] Testing navigation arrows...")
            arrow_selectors = ['.carousel-nav', '.swiper-button', '[aria-label*="next"]', '[aria-label*="siguiente"]', 'button[class*="next"]', 'button[class*="arrow"]']
            arrow_found = False
            for sel in arrow_selectors:
                arrows = page.locator(sel)
                if arrows.count() > 0:
                    box = arrows.first.bounding_box()
                    if box:
                        print(f"[CAROUSEL] Arrow button size: {box['width']:.0f}x{box['height']:.0f}px")
                        arrow_found = True
                        # Check visibility contrast
                        opacity = page.evaluate(f"() => window.getComputedStyle(document.querySelector('{sel}')).opacity")
                        print(f"[CAROUSEL] Arrow opacity: {opacity}")
                    break
            
            if not arrow_found:
                print("[CAROUSEL] ⚠️  No carousel navigation arrows found via standard selectors")
            
            # Test genre selection
            genre_btns = page.locator('[data-testid*="genre"], [class*="genre"], [class*="card"]')
            if genre_btns.count() > 0:
                print(f"[GENRE] {genre_btns.count()} genre cards found")
                genre_btns.first.click()
                click_steps += 1
                time.sleep(1)
                capture(page, "04_genre_selected", "Genre selected state")
            
        except Exception as e:
            print(f"[ERROR] Adventure Selection flow: {e}")
            capture(page, "04_error_adventure_selection", f"Error: {e}")
        
        # =========================================================
        # PASS 3: GAME START (Click depth + initial stream)
        # =========================================================
        print("\n=== PASS 3: GAME START & STREAM ===")
        try:
            start_btns = [
                '[data-testid="start-adventure-btn"]',
                'button:has-text("Empezar")',
                'button:has-text("Start")',
                'button:has-text("Jugar")',
                'button:has-text("Play")',
            ]
            started = False
            for sel in start_btns:
                btn = page.locator(sel)
                if btn.count() > 0:
                    btn.first.click()
                    click_steps += 1
                    started = True
                    print(f"[GAME-START] Clicked: {sel}")
                    break
            
            if not started:
                # Try any prominent CTA
                all_btns = page.query_selector_all('button')
                print(f"[GAME-START] {len(all_btns)} buttons visible. Trying last CTA...")
            
            get_click_depth(click_steps + 1)  # +1 for initial page load
            
            # Check loading state during stream
            time.sleep(2)
            capture(page, "05_game_starting", "Game starting - loading state")
            spinners_game = check_loading_states(page, "Game Starting")
            
            # Check for skeleton loaders on option buttons
            skeletons = page.query_selector_all('[class*="skeleton"], [class*="shimmer"], [class*="pulse"]')
            print(f"[SKELETON] {len(skeletons)} skeleton/shimmer elements during load")
            
            # Wait for narrative
            print("[NARRATIVE] Waiting for AI stream (up to 20s)...")
            try:
                page.wait_for_selector('.narrative-text, [class*="narrative"], [class*="story"], [class*="typewriter"]', timeout=20000)
                time.sleep(3)
                capture(page, "06_narrative_active", "Narrative streaming")
                
                # Check narrative text container
                narrative = page.locator('.narrative-text, [class*="narrative"], [class*="story"]').first
                if narrative.count() > 0:
                    box = narrative.bounding_box()
                    print(f"[NARRATIVE] Container: {box}")
                    
                    # Check line height & readability
                    line_height = page.evaluate("""
                        () => {
                            const el = document.querySelector('.narrative-text') || document.querySelector('[class*="narrative"]');
                            if (!el) return null;
                            const style = window.getComputedStyle(el);
                            return {
                                fontSize: style.fontSize,
                                lineHeight: style.lineHeight,
                                color: style.color,
                                background: style.backgroundColor,
                                padding: style.padding
                            };
                        }
                    """)
                    print(f"[NARRATIVE-STYLE] {line_height}")
                
            except Exception as e:
                print(f"[NARRATIVE] Timeout/error: {e}")
                capture(page, "06_narrative_timeout", "Narrative timeout")
            
        except Exception as e:
            print(f"[ERROR] Game start: {e}")
            capture(page, "05_error_game_start", f"Error: {e}")
        
        # =========================================================
        # PASS 4: OPTION BUTTONS (Post PR #132 validation)
        # =========================================================
        print("\n=== PASS 4: OPTION BUTTONS VALIDATION ===")
        try:
            # Wait for options to appear
            time.sleep(5)
            option_selectors = [
                '[data-testid*="option"]',
                '[class*="option-btn"]',
                '[class*="choice"]',
                'button[class*="game"]',
            ]
            options_found = False
            for sel in option_selectors:
                opts = page.locator(sel)
                if opts.count() > 0:
                    print(f"[OPTIONS] Found {opts.count()} option buttons via '{sel}'")
                    options_found = True
                    for i in range(min(opts.count(), 3)):
                        opt = opts.nth(i)
                        text = opt.inner_text().strip()[:60]
                        box = opt.bounding_box()
                        # Check for placeholder text
                        is_placeholder = text.lower() in ['continue', 'continuar', 'option 1', 'option 2', 'opción 1', 'opción 2', '...', '']
                        status = "⚠️ PLACEHOLDER?" if is_placeholder else "✅ REAL CONTENT"
                        print(f"  Option {i+1}: '{text}' | Size: {box['width']:.0f}x{box['height']:.0f}px | {status}")
                        if box and box['height'] < 44:
                            findings.append({
                                "id": f"UI-OPT-00{i+1}",
                                "severity": "P1",
                                "type": "UI",
                                "title": f"Option button {i+1} below 44px height",
                                "detail": f"Touch target {box['height']:.0f}px, text: '{text}'",
                                "screen": "Game - Options"
                            })
                        if is_placeholder:
                            findings.append({
                                "id": "UX-OPT-PLACEHOLDER",
                                "severity": "P0",
                                "type": "BUG",
                                "title": "Option button shows placeholder text after PR #132",
                                "detail": f"Button text: '{text}' — placeholder not replaced",
                                "screen": "Game - Options"
                            })
                    break
            
            if not options_found:
                print("[OPTIONS] ⚠️  No option buttons found — stream may not have completed")
            
            capture(page, "07_option_buttons", "Option buttons state")
            
        except Exception as e:
            print(f"[ERROR] Options check: {e}")
        
        # =========================================================
        # PASS 5: FULL PAGE SCROLL + OVERFLOW
        # =========================================================
        print("\n=== PASS 5: FULL PAGE SCROLL & OVERFLOW ===")
        try:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1)
            capture(page, "08_scroll_bottom", "Bottom of page / overflow check")
            overflow_game = check_text_overflow(page, "Game Screen")
        except Exception as e:
            print(f"[ERROR] Scroll check: {e}")
        
        # Console errors summary
        print(f"\n=== CONSOLE ERRORS ({len(console_errors)}) ===")
        for err in console_errors[:10]:
            print(f"  [{err['type'].upper()}] {err['text'][:100]}")
        
        browser.close()
        
        # =========================================================
        # SESSION 2: Desktop (1440x900) — Visual Quality Pass
        # =========================================================
        print("\n=== PASS 6: DESKTOP VISUAL QUALITY (1440x900) ===")
        browser2 = p.chromium.launch(headless=True)
        ctx2 = browser2.new_context(viewport={"width": 1440, "height": 900})
        page2 = ctx2.new_page()
        
        page2.goto(PROD_URL)
        page2.wait_for_load_state('networkidle', timeout=30000)
        capture(page2, "09_desktop_main_menu", "Desktop - Main menu")
        
        # Full page desktop screenshot
        page2.screenshot(path=f"{OUT_DIR}10_desktop_full.png", full_page=True)
        print(f"[SCREENSHOT] {OUT_DIR}10_desktop_full.png — Desktop full page")
        
        # Check font loading
        fonts = page2.evaluate("""
            () => [...document.fonts].map(f => ({ family: f.family, status: f.status }))
        """)
        print(f"[FONTS] {len(fonts)} fonts loaded: {set(f['family'] for f in fonts)}")
        
        # Check for flash of unstyled content indicators
        has_noscript = page2.query_selector('noscript') is not None
        print(f"[FOUC] noscript element present: {has_noscript}")
        
        browser2.close()
        
        # =========================================================
        # FINAL REPORT
        # =========================================================
        print("\n=== AUDIT COMPLETE ===")
        print(f"Hit-area issues found: {len(hit_issues)}")
        print(f"Console errors captured: {len(console_errors)}")
        print(f"Programmatic findings: {len(findings)}")
        
        # Compile all issues
        all_issues = hit_issues + [
            {
                "id": f"CONSOLE-{i:03d}",
                "severity": "P2",
                "type": "BUG",
                "title": e['text'][:80],
                "context": "Browser Console",
                "screen": "Runtime"
            } for i, e in enumerate(console_errors[:5])
        ] + findings
        
        # Save JSON report
        report = {
            "audit_version": "v2-deep",
            "date": "2026-02-19T11:05:00+01:00",
            "url": PROD_URL,
            "device": "iPhone 13 (375x812) + Desktop (1440x900)",
            "network": "Slow 3G (300kbps/500ms latency)",
            "total_issues": len(all_issues),
            "issues": all_issues,
            "console_errors": console_errors[:20]
        }
        
        with open("audit_v2_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\nReport saved: audit_v2_report.json")
        print(f"Screenshots saved: {OUT_DIR}*.png")
        return report

if __name__ == "__main__":
    run_audit()
