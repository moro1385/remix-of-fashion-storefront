from playwright.sync_api import sync_playwright
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # Go to root to set localStorage
        page.goto('http://localhost:8080')

        # Mock admin auth store
        mock_auth = {
            "state": {
                "session": { "user": { "id": "admin123", "email": "admin@test.com" }, "access_token": "mock" },
                "profile": { "id": "admin123", "first_name": "Admin" },
                "isAuthenticated": True,
                "isAdmin": True
            },
            "version": 0
        }

        page.evaluate(f"window.localStorage.setItem('jamimode-auth', JSON.stringify({json.dumps(mock_auth)}))")

        # Go to admin layout to verify sidebar
        page.goto('http://localhost:8080/admin')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/home/jules/verification/admin_layout.png')

        # Go to new admin messages page
        page.goto('http://localhost:8080/admin/messages')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/home/jules/verification/admin_messages.png')

        browser.close()

if __name__ == '__main__':
    run()
