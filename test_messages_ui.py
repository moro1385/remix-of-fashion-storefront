from playwright.sync_api import sync_playwright
import time
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # Go to a page on the domain first to set localStorage
        page.goto('http://localhost:8080')

        # Mock auth store
        mock_auth = {
            "state": {
                "session": { "user": { "id": "123", "email": "test@test.com" }, "access_token": "mock" },
                "profile": { "id": "123", "first_name": "Test" },
                "isAuthenticated": True,
                "isAdmin": False
            },
            "version": 0
        }

        page.evaluate(f"window.localStorage.setItem('jamimode-auth', JSON.stringify({json.dumps(mock_auth)}))")

        # Reload to apply auth state
        page.reload()
        page.wait_for_load_state('networkidle')

        page.screenshot(path='/home/jules/verification/home_auth.png')

        # Go to messages page
        page.goto('http://localhost:8080/account/messages')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/home/jules/verification/messages_page.png')

        browser.close()

if __name__ == '__main__':
    run()
