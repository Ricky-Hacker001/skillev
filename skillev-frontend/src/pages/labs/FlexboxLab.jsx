import React, { useState, useEffect } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { RefreshCw, CheckCircle, AlertTriangle, ArrowLeft, Code, FileCode, FileJson } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FlexboxLab() {
  const navigate = useNavigate();

  // --- STATE FOR 3 FILES ---
  const [activeTab, setActiveTab] = useState('css'); // 'html' | 'css' | 'js'
  
  const [htmlCode, setHtmlCode] = useState(`
<div class="navbar">
  <div class="logo">Skillev</div>
  <ul class="nav-links">
    <li>Home</li>
    <li>About</li>
    <li>Contact</li>
  </ul>
</div>
<div class="content">
  <h1>Welcome to the Grid.</h1>
  <p>Edit HTML, CSS, and JS to customize this page.</p>
</div>`);

  const [cssCode, setCssCode] = useState(`
body { font-family: 'Inter', sans-serif; background: #f4f4f5; padding: 2rem; }
.navbar {
  background: #18181b;
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  /* TASK: Use Flexbox to separate Logo and Links */
  display: flex; 
  justify-content: space-between;
  align-items: center;
}
.nav-links {
  list-style: none;
  /* TASK: Make links horizontal */
  display: flex;
  gap: 20px;
}
.nav-links li { padding: 0 10px; }
.logo { font-weight: bold; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px; }
.content { margin-top: 2rem; padding: 1rem; }
`);

  const [jsCode, setJsCode] = useState(`
console.log("Lab Environment Ready.");
const logo = document.querySelector('.logo');
if(logo) {
  logo.addEventListener('click', () => {
    alert('System Active!');
  });
}
`);

  const [status, setStatus] = useState("idle");
  const BASE_DOCKER_URL = "http://localhost:5001";
  
  // We use this to FORCE the iframe to reload by changing the URL
  const [previewUrl, setPreviewUrl] = useState(BASE_DOCKER_URL);

  // --- SYNC FUNCTION ---
  const updatePreview = async () => {
    setStatus("saving");
    try {
      // 1. Send Data to Backend
      const response = await fetch(`${BASE_DOCKER_URL}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            html: htmlCode,
            css: cssCode,
            js: jsCode
        }),
      });

      if (!response.ok) throw new Error("Backend failed");
      
      // 2. FORCE RELOAD (The Fix)
      // We add a random number (?t=...) to the URL. 
      // This tricks the browser into thinking it's a new page, so it reloads.
      setPreviewUrl(`${BASE_DOCKER_URL}/?t=${Date.now()}`);
      
      setStatus("success");
    } catch (err) {
      console.error("Docker Connection Failed:", err);
      setStatus("error");
    }
  };

  // Debounce (Auto-save after 1s)
  useEffect(() => {
    const timeout = setTimeout(() => updatePreview(), 1000);
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  // --- HELPER TO GET CURRENT CODE ---
  const getCurrentCode = () => {
    if (activeTab === 'html') return htmlCode;
    if (activeTab === 'css') return cssCode;
    return jsCode;
  };

  const setCurrentCode = (val) => {
    if (activeTab === 'html') setHtmlCode(val);
    if (activeTab === 'css') setCssCode(val);
    if (activeTab === 'js') setJsCode(val);
  };

  const getLanguage = () => {
      if (activeTab === 'html') return 'html';
      if (activeTab === 'js') return 'js';
      return 'css';
  }

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="h-14 border-b border-white/10 bg-black flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-emerald-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xs font-black tracking-[0.2em] uppercase text-white/80">
            <span className="text-emerald-500">LAB_01 //</span> Full_Stack_Playground
          </h1>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          {status === "error" && (
             <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-wider">
               <AlertTriangle size={12}/> Connection_Lost
             </div>
          )}
          {status === "success" && (
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
               <CheckCircle size={12}/> Live_Link_Active
             </div>
          )}
          {status === "saving" && (
             <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
               <RefreshCw className="animate-spin" size={12}/> Syncing...
             </div>
          )}
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: EDITOR */}
        <div className="w-1/2 flex flex-col border-r border-white/10">
          
          {/* TABS */}
          <div className="flex bg-[#121212] border-b border-white/5">
            <button 
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-white/5
                ${activeTab === 'html' ? 'bg-[#1e1e1e] text-orange-400 border-t-2 border-t-orange-400' : 'text-white/40 hover:text-white hover:bg-[#1a1a1a]'}`}
            >
                <Code size={14} /> index.html
            </button>
            <button 
                onClick={() => setActiveTab('css')}
                className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-white/5
                ${activeTab === 'css' ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-t-blue-400' : 'text-white/40 hover:text-white hover:bg-[#1a1a1a]'}`}
            >
                <FileCode size={14} /> style.css
            </button>
            <button 
                onClick={() => setActiveTab('js')}
                className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-white/5
                ${activeTab === 'js' ? 'bg-[#1e1e1e] text-yellow-400 border-t-2 border-t-yellow-400' : 'text-white/40 hover:text-white hover:bg-[#1a1a1a]'}`}
            >
                <FileJson size={14} /> script.js
            </button>
          </div>

          {/* EDITOR AREA */}
          <div className="flex-1 bg-[#0a0a0a] overflow-auto relative">
            <CodeEditor
              value={getCurrentCode()}
              language={getLanguage()}
              placeholder="Start coding..."
              onChange={(evn) => setCurrentCode(evn.target.value)}
              padding={24}
              style={{
                fontSize: 14,
                backgroundColor: "transparent",
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                minHeight: "100%",
              }}
            />
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="bg-[#f4f4f5] px-4 py-2 border-b flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Render Output // Port 5001
            </span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400/80"/>
              <div className="w-2 h-2 rounded-full bg-yellow-400/80"/>
              <div className="w-2 h-2 rounded-full bg-green-400/80"/>
            </div>
          </div>
          <iframe 
            id="preview-frame"
            src={previewUrl}
            title="Live Preview"
            className="w-full h-full border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
}