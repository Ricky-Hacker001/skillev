from flask import Flask, render_template, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 1. State for all three files
current_state = {
    "html": """
<div class="navbar">
  <div class="logo">Skillev</div>
  <ul class="nav-links">
    <li>Home</li>
    <li>About</li>
    <li>Contact</li>
  </ul>
</div>
<div class="content">
  <h1>Welcome, Dev.</h1>
  <button id="alert-btn">Click Me</button>
</div>
""",
    "css": """
body { font-family: sans-serif; background: #f0f0f0; padding: 20px; }
.navbar {
  background: #333;
  color: white;
  padding: 1rem;
  /* HINT: Use Flexbox here to align the logo and links! */
  
}
.nav-links {
  list-style: none;
  /* HINT: Use Flexbox here to make links horizontal! */
  
}
.nav-links li { padding: 0 10px; }
""",
    "js": """
document.getElementById('alert-btn').addEventListener('click', () => {
  alert('JavaScript is running!');
});
"""
}

@app.route('/')
def home():
    # Inject all three codes into the template
    return render_template('index.html', 
                           html_code=current_state['html'], 
                           css_code=current_state['css'], 
                           js_code=current_state['js'])

@app.route('/update', methods=['POST'])
def update_code():
    global current_state
    data = request.json
    # Update only the fields sent by React
    if 'html' in data: current_state['html'] = data['html']
    if 'css' in data: current_state['css'] = data['css']
    if 'js' in data: current_state['js'] = data['js']
    
    return {"status": "updated", "state": current_state}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)