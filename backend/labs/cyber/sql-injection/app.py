from flask import Flask, request, render_template_string
import sqlite3
import sys

app = Flask(__name__)

# Setup a dummy database in memory
def init_db():
    conn = sqlite3.connect(':memory:', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE users (id INTEGER, username TEXT, password TEXT)')
    cursor.execute("INSERT INTO users VALUES (1, 'admin', 'skillev_secret_123')")
    return conn

db = init_db()

# --- SECURITY HEADERS FOR IFRAME SUPPORT ---
@app.after_request
def add_security_headers(response):
    # Allow the Skillev Workspace to frame this lab
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    response.headers['Content-Security-Policy'] = "frame-ancestors *"
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Skillev Lab</title>
    <style>
        body { font-family: sans-serif; background: #121212; color: #eee; padding: 40px; }
        .container { max-width: 500px; margin: auto; background: #1e1e1e; padding: 20px; border-radius: 8px; border: 1px solid #333; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #333; border: 1px solid #444; color: white; border-radius: 4px; }
        input[type="submit"] { background: #10b981; cursor: pointer; border: none; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        .evidence-banner { background: #10b9811a; color: #10b981; padding: 10px; border-radius: 4px; font-size: 0.7em; margin-bottom: 20px; text-align: center; font-weight: bold; border: 1px solid #10b98133; }
    </style>
</head>
<body>
    <div class="container">
        <div class="evidence-banner">🛡️ SKILLEV_PROTOCOL: EVIDENCE_RECORDER_ACTIVE</div>
        <h1>SQL Injection Lab</h1>
        <p style="color: #888; font-size: 0.9em;">Goal: Login as <b>admin</b> using SQL bypass.</p>
        <form method="POST">
            <label style="font-size: 0.8em; color: #666;">Username:</label>
            <input type="text" name="username" placeholder="admin">
            <label style="font-size: 0.8em; color: #666;">Password:</label>
            <input type="text" name="password" placeholder="password">
            <input type="submit" value="Execute Login">
        </form>
        {% if message %} 
            <div style="margin-top:20px; padding:15px; background:#1a1a1a; border-left: 4px solid #10b981; font-size: 0.9em;">
                {{ message | safe }}
            </div> 
        {% endif %}
    </div>
</body>
</html>
'''

@app.route('/', methods=['GET', 'POST'])
def login():
    message = ""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        print(f"EVIDENCE_LOG: Attempting Query: {query}", flush=True)
        
        try:
            cursor = db.cursor()
            user = cursor.execute(query).fetchone()
            if user:
                result_msg = f"SUCCESS: Logged in as {user[1]}"
                print(f"EVIDENCE_LOG: Result: {result_msg}", flush=True)
                message = f"<span style='color:#10b981;'>✅ <b>{result_msg}</b></span><br><br><small style='color:#666;'>Evidence has been sealed for the recruiter.</small>"
            else:
                print(f"EVIDENCE_LOG: Result: Failed Login", flush=True)
                message = "<span style='color:#ef4444;'>❌ Invalid credentials. Sequence failed.</span>"
        except Exception as e:
            error_msg = f"SQL ERROR: {str(e)}"
            print(f"EVIDENCE_LOG: {error_msg}", flush=True)
            message = f"<span style='color:#f59e0b;'>⚠️ <b>{error_msg}</b></span>"
            
    return render_template_string(HTML_TEMPLATE, message=message)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)