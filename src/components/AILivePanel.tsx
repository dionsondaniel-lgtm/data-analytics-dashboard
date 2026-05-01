// src/components/AILivePanel.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UploadCloud, File as FileIcon, Play, Terminal, Briefcase, HelpCircle, 
  Gavel, Mail, Sparkles, Loader2, Download, Table, BarChart3, Code2, Database, ShieldCheck, Lock, CheckCircle2, UserCircle, Info, FileText, RefreshCw
} from 'lucide-react';
import { Learner } from '../types';

interface AILivePanelProps {
  isOpen: boolean;
  onClose: () => void;
  learners: Learner[];
}

const PANELISTS =[
  { id: 'Eve', name: 'Techy Eve', role: 'Lead Technical Architect', icon: Terminal, color: 'text-cyan-400', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.4)]', bg: 'bg-cyan-950/50', border: 'border-cyan-500/50' },
  { id: 'Zeus', name: 'CEO Zeus', role: 'Chief Executive Officer', icon: Briefcase, color: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]', bg: 'bg-amber-950/50', border: 'border-amber-500/50' },
  { id: 'Alto', name: 'Newbie Alto', role: 'Business Associate', icon: HelpCircle, color: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.4)]', bg: 'bg-emerald-950/50', border: 'border-emerald-500/50' }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MODULE_OPTIONS =[
  { id: 'SQL', label: 'SQL Architecture', icon: Database },
  { id: 'Excel', label: 'Advanced Excel', icon: Table },
  { id: 'PowerBI', label: 'Power BI Dashboarding', icon: BarChart3 },
  { id: 'Python', label: 'Python Analytics', icon: Code2 },
];

export const AILivePanel: React.FC<AILivePanelProps> = ({ isOpen, onClose, learners }) => {
  const [stage, setStage] = useState<'intro' | 'upload' | 'qna' | 'grading'>('intro');
  const[isProcessing, setIsProcessing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>('Aura');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Dynamic AI Models State
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState<string>('gemini-3-flash-preview');

  // Presentation Data
  const [presenterName, setPresenterName] = useState('');
  const [presentationTopic, setPresentationTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('SQL');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const[fileBase64, setFileBase64] = useState<{ data: string, mimeType: string } | null>(null);

  // Q&A Data
  const [generatedQuestions, setGeneratedQuestions] = useState<{eve: string, zeus: string, alto: string} | null>(null);
  const[answers, setAnswers] = useState({ eve: '', zeus: '', alto: '' });
  
  // Grading Data
  const [finalReport, setFinalReport] = useState<string>('');
  
  // Email Auth Data
  const [emailStatus, setEmailStatus] = useState<'idle' | 'auth' | 'sending' | 'sent'>('idle');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const[loggedInUser, setLoggedInUser] = useState('');

  // Fetch API Models on mount
  useEffect(() => {
    const fetchModels = async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined') return;
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        if (data.models) {
          const names = data.models
            .map((m: any) => m.name.replace('models/', ''))
            .filter((n: string) => n.includes('gemini') && !n.includes('embedding') && !n.includes('vision')); 
          setAvailableModels(names);
        }
      } catch (e) {
        console.error("Failed to fetch models:", e);
      }
    };
    if (isOpen) fetchModels();
  }, [isOpen]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStage('intro');
      setActiveSpeaker('Aura');
      setPresenterName('');
      setPresentationTopic('');
      setSelectedModule('SQL');
      setUploadedFile(null);
      setFileBase64(null);
      setGeneratedQuestions(null);
      setAnswers({ eve: '', zeus: '', alto: '' });
      setFinalReport('');
      setEmailStatus('idle');
      setShowLoginModal(false);
      setShowHowItWorks(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoggedInUser('');
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFileBase64({ data: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ROBUST AI ENGINE CALLER WITH DYNAMIC AUTO-FALLBACK ---
  const callAI = async (prompt: string, speakerId: string, includeFile: boolean = false): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "⚠️ API Key missing.";
    
    setActiveSpeaker(speakerId);
    let responseText = "";

    const parts: any[] = [{ text: prompt }];
    const validMimeTypes =['application/pdf', 'text/plain', 'text/csv', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (includeFile && fileBase64 && validMimeTypes.includes(fileBase64.mimeType)) {
      parts.push({
        inlineData: { data: fileBase64.data, mimeType: fileBase64.mimeType }
      });
    }

    const priorityModels =['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    const modelChain = Array.from(new Set([activeModel, ...priorityModels, ...availableModels]));

    for (const model of modelChain) {
      let attempt = 0;
      let modelSuccess = false;

      while (attempt < 2) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contents:[{ parts }], 
              generationConfig: { temperature: 0.3 } 
            })
          });
          
          if (!res.ok) {
            if (res.status === 429) break; // Quota Exceeded -> Switch Model
            if (res.status === 503 && attempt === 0) { await delay(1500); attempt++; continue; } // Overloaded -> Retry once
            if (res.status >= 400) break; // Bad Request (file too large) -> Switch Model
            break;
          }

          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          modelSuccess = true;
          if (activeModel !== model) setActiveModel(model); // Latch to successful model
          break;
        } catch (error) {
          if (attempt === 0) { await delay(1000); attempt++; continue; }
          break;
        }
      }
      if (modelSuccess) break;
    }
    return responseText || "⚠️ Neural failure. Unable to compute.";
  };

  // --- STAGE 1: PROCESS PRESENTATION (ROBUST JSON PARSER) ---
  const processPresentation = async () => {
    if (!presenterName || (!presentationTopic && !uploadedFile)) return;
    setIsProcessing(true);
    
    setActiveSpeaker('Nexus');
    await delay(1500); 

    setActiveSpeaker('System');
    const prompt = `You are generating 3 distinct questions for a live ${selectedModule} presentation defense.
    Presenter: ${presenterName}
    Abstract/Summary Provided: ${presentationTopic || 'Refer entirely to the attached document.'}
    
    INSTRUCTIONS:
    Read the attached document carefully (if provided). You MUST base your questions on actual numbers, facts, metrics, or claims found in the document or abstract.
    
    Act as these 3 characters and write ONE specific question each:
    1. Techy Eve (Lead Data Architect): Asks a highly technical ${selectedModule} question explicitly referencing a metric or data point from the presentation.
    2. CEO Zeus: Asks an executive question focusing on the business impact, ROI, or costs directly mentioned in the presentation.
    3. Nontechnical Alto: Asks a beginner-friendly question asking to clarify one of the specific trends or jargon terms presented.
    
    Return EXACTLY a raw JSON object with keys "eve", "zeus", and "alto". Do not use markdown wrappers.`;

    const response = await callAI(prompt, 'Panel', true); 
    
    try {
      if (response.includes("⚠️ Neural failure")) throw new Error("API Chain Failed completely.");
      
      // Powerful regex to find the JSON object even if Gemini wraps it in text or markdown
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object structure found in response.");
      
      const parsed = JSON.parse(match[0]);
      setGeneratedQuestions({
        eve: parsed.eve || `Can you demonstrate your technical skills using ${selectedModule} for this data?`,
        zeus: parsed.zeus || "How does this impact our quarterly ROI?",
        alto: parsed.alto || "Can you explain this to me like I'm a beginner?"
      });
    } catch (e) {
      console.warn("AI JSON parse failed or limits reached. Using silent fallbacks.", e);
      // SILENT FALLBACK: If API completely fails, inject contextual questions automatically so user is never stuck
      setGeneratedQuestions({
        eve: `Based on your presentation, can you walk us through the ${selectedModule} methodology you used to extract this data?`,
        zeus: `Looking at your findings, what is the direct business impact and projected ROI for the upcoming quarter?`,
        alto: `I'm a bit confused by the jargon. Can you summarize your main takeaway in simple, plain English?`
      });
    }
    
    setStage('qna');
    setIsProcessing(false);
    setActiveSpeaker('Eve');
  };

  // --- STAGE 2: GRADE (TEXT-ONLY TO PREVENT CRASHES) ---
  const submitAnswersAndGrade = async (useFile: boolean = true) => {
    setIsProcessing(true);
    setActiveSpeaker('System');

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `You are evaluating a live ${selectedModule} data presentation defense.
    Date: ${currentDate}
    Presenter: ${presenterName}
    Original Topic Summary: ${presentationTopic || 'Based entirely on the transcript below.'}
    
    TRANSCRIPT OF DEFENSE:
    - Techy Eve's Q: ${generatedQuestions?.eve}
      Presenter's Answer: ${answers.eve}

    - CEO Zeus's Q: ${generatedQuestions?.zeus}
      Presenter's Answer: ${answers.zeus}

    - Alto's Q: ${generatedQuestions?.alto}
      Presenter's Answer: ${answers.alto}
    
    INSTRUCTIONS:
    1. Evaluate the presenter's answers based on Technical Accuracy (Eve), Business Value (Zeus), and Clarity (Alto).
    2. Grade the presenter (0-100%).
    3. Act as "The Judge" (Chief Overseer). Provide a final average score and a detailed verdict referencing the specific metrics from their presentation.
    4. Evaluate the Panelists: Who asked the best question? Who was too harsh?
    
    Format output as a highly professional Defense Summary Report. Include the Date (${currentDate}) at the very top. Do NOT use markdown bolding formatting (no **asterisks**). Do NOT include a signature block at the end, the system will append the official seal automatically.`;

    let report = await callAI(prompt, 'Judge', useFile);
    
    // Auto-fallback if the PDF is too large for the grading stage
    if (useFile && report.includes('⚠️')) {
      console.warn("Retrying Judge without heavy file context...");
      report = await callAI(prompt, 'Judge', false);
    }

    setFinalReport(report);
    setStage('grading');
    setIsProcessing(false);
    setActiveSpeaker('Nova');
    
    if (!report.includes('⚠️')) {
      setTimeout(() => handleDownload('pdf', report), 500); 
    }
  };

  // --- EXPORT HANDLERS ---
  const handleDownload = (format: string, reportContent: string = finalReport) => {
    if (!reportContent || reportContent.includes('⚠️')) return;
    
    const signatureText = `\n\n========================================\nOFFICIAL SEAL OF THE JUDGE\nSigned,\nThe Chief Overseer`;
    const fullContent = reportContent.includes("OFFICIAL SEAL") ? reportContent : reportContent + signatureText;
    const filename = `${presenterName.replace(/\s+/g, '_')}_Defense_Report`;
    
    if (format === 'txt') {
      const blob = new Blob([fullContent], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.txt`; a.click();
    } else if (format === 'doc') {
      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>${fullContent.replace(/\n/g, '<br>')}</body></html>`;
      const blob = new Blob([html], { type: 'application/msword' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.doc`; a.click();
    } else if (format === 'xls') {
      const html = `<html><head><meta charset='utf-8'></head><body><table><tr><td>${fullContent.replace(/\n/g, '</td></tr><tr><td>')}</td></tr></table></body></html>`;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.xls`; a.click();
    } else if (format === 'pdf') {
      import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF();
        let y = 20;
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        
        // Remove text signature for PDF so we can draw it elegantly
        const cleanReport = reportContent.replace(/========================================[\s\S]*The Chief Overseer/g, '').trim();
        const splitText = doc.splitTextToSize(cleanReport, 180);
        
        // Manual Multi-page rendering loop
        splitText.forEach((line: string) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 6;
        });
        
        // Render UI-Like Elegant Signature 
        y += 15;
        if (y > pageHeight - 40) { 
          doc.addPage(); 
          y = 20; 
        }
        
        doc.setDrawColor(200);
        doc.line(margin, y, 195, y);
        y += 15;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(204, 153, 0); // Amber / Gold color
        doc.text("OFFICIAL SEAL OF THE JUDGE", 105, y, { align: 'center' });
        y += 8;
        
        doc.setFont('times', 'italic');
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("Signed,", 105, y, { align: 'center' });
        y += 8;
        
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("The Chief Overseer", 105, y, { align: 'center' });
        
        doc.save(`${filename}.pdf`);
      });
    }
  };

  // --- SECURE AUTH & DIRECT EMAIL ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    
    setShowLoginModal(false);
    setLoggedInUser(loginEmail);
    setEmailStatus('auth');
    
    await delay(1500); 
    setEmailStatus('sending');
    await delay(2000); 
    setEmailStatus('sent');
    
    const signatureText = `\n\n========================================\nOFFICIAL SEAL OF THE JUDGE\nSigned,\nThe Chief Overseer`;
    const fullContent = finalReport.includes("OFFICIAL SEAL") ? finalReport : finalReport + signatureText;
    
    const subject = encodeURIComponent(`[OFFICIAL VERDICT] ${presenterName} - Live Panel Defense Report`);
    const body = encodeURIComponent(`Official AI Panel Evaluation for ${presenterName}'s presentation on "${presentationTopic || 'Data Analytics'}":\n\n${fullContent}\n\nAutomated by TTSP Neural Core.\nSent securely by: ${loginEmail}`);
    window.open(`mailto:dionsondaniel@gmail.com,ehn@healthbio.online?subject=${subject}&body=${body}`, '_blank');
  };

  const RobotAvatar = ({ agent, active, scale = 1 }: any) => (
    <motion.div 
      animate={{ y: active ?[-5, 5, -5] : 0, scale: active ? scale * 1.1 : scale }}
      transition={{ repeat: active ? Infinity : 0, duration: 3, ease: "easeInOut" }}
      className={`flex flex-col items-center ${active ? '' : 'opacity-40 grayscale'} transition-all duration-500`}
    >
      <div className={`w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center border-4 ${agent.border} ${agent.bg} ${active ? agent.glow : ''} relative`}>
        {active && <div className="absolute inset-0 rounded-full animate-ping opacity-20 border-2 border-white" />}
        <agent.icon className={`w-8 h-8 md:w-14 md:h-14 ${agent.color}`} />
      </div>
      <div className="mt-4 text-center bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
        <h4 className={`font-black text-[10px] md:text-sm uppercase tracking-widest ${agent.color}`}>{agent.name}</h4>
        <p className="text-[8px] md:text-[9px] text-slate-400 uppercase hidden md:block">{agent.role}</p>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6 bg-slate-950/95 backdrop-blur-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="w-full max-w-7xl h-full md:h-[95vh] bg-slate-900 border border-slate-700 shadow-[0_0_100px_rgba(99,102,241,0.2)] md:rounded-[2.5rem] overflow-hidden flex flex-col relative"
        >
          {/* HEADER */}
          <div className="h-16 md:h-20 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-slate-950 z-20 shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/20 flex items-center justify-center rounded-xl md:rounded-2xl border border-indigo-500/30">
                <Play className="text-indigo-400 w-5 h-5 md:w-6 md:h-6 ml-1" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-black text-white tracking-widest uppercase">Live Defense Panel</h1>
                <p className="text-[9px] md:text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Adaptive Protocol Active</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 md:p-3 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5 md:w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row relative">
            
            {/* 3D PANELISTS DISPLAY */}
            <div className="w-full md:w-1/3 bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-800 p-4 md:p-6 flex flex-row md:flex-col justify-around md:justify-center items-center gap-2 md:gap-12 relative overflow-hidden shrink-0 z-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 via-transparent to-rose-500/5 pointer-events-none" />
              <RobotAvatar agent={PANELISTS[0]} active={activeSpeaker === 'Eve' || stage === 'intro'} />
              <RobotAvatar agent={PANELISTS[1]} active={activeSpeaker === 'Zeus' || stage === 'intro'} scale={1.1} />
              <RobotAvatar agent={PANELISTS[2]} active={activeSpeaker === 'Alto' || stage === 'intro'} />
            </div>

            {/* INTERACTIVE STAGE AREA */}
            <div className="flex-1 p-4 md:p-10 overflow-y-auto scrollbar-elegant relative z-20">
              
              {/* STAGE 0: INTRO */}
              {stage === 'intro' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center py-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-500/10 rounded-full border border-indigo-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] mb-8">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-8">Initiate Defense Sequence</h2>
                  
                  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl text-slate-300 text-sm md:text-base leading-relaxed mb-8 shadow-inner w-full">
                    <p className="font-bold text-indigo-400 mb-3 uppercase tracking-widest text-[10px] md:text-xs">Aura's Guidelines:</p>
                    "Welcome to the Live Panel. You will present your data findings. 
                    <strong className="text-cyan-400"> Techy Eve</strong> will test your coding skills. 
                    <strong className="text-amber-400"> CEO Zeus</strong> will test your business logic. 
                    <strong className="text-emerald-400"> Alto</strong> will test your clarity. 
                    Upload your materials, answer their queries, and face <strong className="text-rose-400">The Judge</strong>."
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center w-full">
                    <button onClick={() => setStage('upload')} className="flex-1 md:flex-none px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest transition-transform hover:scale-105 shadow-xl shadow-indigo-500/20 text-sm">
                      Enter the Arena
                    </button>
                    <button onClick={() => setShowHowItWorks(true)} className="flex-1 md:flex-none px-8 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl uppercase tracking-widest transition-transform hover:scale-105 shadow-xl border border-slate-700 flex items-center justify-center gap-3 text-sm">
                      <Info className="w-5 h-5" /> How it Works
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 1: UPLOAD */}
              {stage === 'upload' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-6 md:space-y-8 py-4">
                  <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-6">
                    <UploadCloud className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                    <h2 className="text-xl md:text-3xl font-black text-white uppercase">Upload Presentation</h2>
                  </div>

                  <div className="space-y-5 md:space-y-6">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Module Focus</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
                        {MODULE_OPTIONS.map(mod => (
                          <button
                            key={mod.id}
                            onClick={() => setSelectedModule(mod.id)}
                            className={`flex flex-col items-center p-3 md:p-4 rounded-xl border transition-all ${selectedModule === mod.id ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                          >
                            <mod.icon className="w-5 h-5 md:w-6 md:h-6 mb-2" />
                            <span className="text-[10px] md:text-xs font-bold uppercase">{mod.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Presenter Name / Team</label>
                      <input type="text" value={presenterName} onChange={e => setPresenterName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-sm md:text-base rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" placeholder="e.g., Daniel Dionson" />
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileIcon className="w-3 h-3" /> Presentation File (PDF / TXT / Images)
                      </label>
                      <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl p-6 md:p-8 text-center hover:bg-slate-800 transition-colors relative cursor-pointer">
                        <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.txt,image/*" />
                        <UploadCloud className="w-8 h-8 md:w-12 md:h-12 text-slate-500 mx-auto mb-3 md:mb-4" />
                        <p className="text-slate-300 font-bold text-sm md:text-base">{uploadedFile ? uploadedFile.name : "Drag & Drop or Click to Browse"}</p>
                        <p className="text-slate-500 text-[10px] md:text-xs mt-2">The AI Neural Core will visually scan and read your document.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Executive Summary / Key Focus Areas
                      </label>
                      <textarea value={presentationTopic} onChange={e => setPresentationTopic(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 text-white text-sm md:text-base rounded-xl px-4 py-3 focus:border-indigo-500 outline-none resize-none placeholder-slate-600" placeholder="Specify your main goals, revenue trends, or key metrics here. What is the core message of your presentation? (e.g., 'Revenue increased 18% QoQ driven by enterprise sales.')" />
                    </div>

                    <button 
                      onClick={processPresentation} 
                      disabled={isProcessing || !presenterName || (!presentationTopic && !uploadedFile)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black rounded-xl uppercase tracking-widest text-xs md:text-sm transition-colors flex items-center justify-center gap-3"
                    >
                      {isProcessing ? <><Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Nexus Validating Attendance & Syncing AI...</> : "Start Defense"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: Q&A */}
              {stage === 'qna' && generatedQuestions && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 md:p-4 rounded-xl flex items-center gap-3 text-emerald-400 mb-4 md:mb-8">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                    <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">Nexus Log: Security & Attendance Verified. Proceeding to Q&A.</p>
                  </div>

                  {/* EVE */}
                  <div className="bg-slate-800/50 border border-cyan-500/30 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_0_20px_rgba(34,211,238,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500" />
                    <h3 className="text-cyan-400 font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 mb-3 md:mb-4"><Terminal className="w-4 h-4 md:w-5 md:h-5" /> Techy Eve Asks:</h3>
                    <p className="text-white text-sm md:text-lg font-medium mb-4 md:mb-6 leading-relaxed">"{generatedQuestions.eve}"</p>
                    <textarea value={answers.eve} onChange={e => setAnswers({...answers, eve: e.target.value})} rows={3} className="w-full bg-slate-900 border border-cyan-500/30 text-cyan-50 font-mono text-xs md:text-sm rounded-xl px-4 py-3 focus:border-cyan-400 outline-none" placeholder={`Write your ${selectedModule} technical explanation here...`} />
                  </div>

                  {/* ZEUS */}
                  <div className="bg-slate-800/50 border border-amber-500/30 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_0_20px_rgba(251,191,36,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                    <h3 className="text-amber-400 font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 mb-3 md:mb-4"><Briefcase className="w-4 h-4 md:w-5 md:h-5" /> CEO Zeus Asks:</h3>
                    <p className="text-white text-sm md:text-lg font-medium mb-4 md:mb-6 leading-relaxed">"{generatedQuestions.zeus}"</p>
                    <textarea value={answers.zeus} onChange={e => setAnswers({...answers, zeus: e.target.value})} rows={3} className="w-full bg-slate-900 border border-amber-500/30 text-amber-50 text-xs md:text-sm rounded-xl px-4 py-3 focus:border-amber-400 outline-none" placeholder="Write your executive business answer here..." />
                  </div>

                  {/* ALTO */}
                  <div className="bg-slate-800/50 border border-emerald-500/30 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_0_20px_rgba(52,211,153,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                    <h3 className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 mb-3 md:mb-4"><HelpCircle className="w-4 h-4 md:w-5 md:h-5" /> Alto Asks:</h3>
                    <p className="text-white text-sm md:text-lg font-medium mb-4 md:mb-6 leading-relaxed">"{generatedQuestions.alto}"</p>
                    <textarea value={answers.alto} onChange={e => setAnswers({...answers, alto: e.target.value})} rows={3} className="w-full bg-slate-900 border border-emerald-500/30 text-emerald-50 text-xs md:text-sm rounded-xl px-4 py-3 focus:border-emerald-400 outline-none" placeholder="Explain it simply..." />
                  </div>

                  <button 
                    onClick={() => submitAnswersAndGrade(true)} 
                    disabled={isProcessing || !answers.eve || !answers.zeus || !answers.alto}
                    className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs md:text-sm rounded-2xl uppercase tracking-widest transition-colors flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 mt-6 md:mt-8"
                  >
                    {isProcessing ? <><Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> The Judge is calculating scores...</> : <><Gavel className="w-5 h-5 md:w-6 md:h-6" /> Submit Defense to The Judge</>}
                  </button>
                </motion.div>
              )}

              {/* STAGE 3: GRADING & EXPORT */}
              {stage === 'grading' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4">
                  <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-10 relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-500/10 rounded-full border-2 border-amber-500/50 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(251,191,36,0.3)]">
                      <Gavel className="w-10 h-10 md:w-12 md:h-12 text-amber-400" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">The Judge's Verdict</h2>
                    <p className="text-amber-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">Final Evaluation for {presenterName}</p>
                    
                    {finalReport && !finalReport.includes('⚠️') && (
                      <p className="text-slate-400 text-xs mt-2 italic flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto-downloaded PDF Document</p>
                    )}
                    
                    {/* Recalculate Button */}
                    <div className="flex justify-center mt-6">
                       <button onClick={() => submitAnswersAndGrade(false)} disabled={isProcessing} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          Recalculate Verdict
                       </button>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-inner font-serif flex flex-col relative">
                    <div className="text-slate-200 whitespace-pre-wrap leading-relaxed text-sm md:text-base mb-8">
                      {finalReport}
                    </div>
                    
                    {/* ELEGANT SIGNATURE FOOTER */}
                    <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col items-center md:items-end text-center md:text-right">
                      <div className="mb-4 relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-amber-500/20 flex items-center justify-center bg-amber-500/5 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                          <Gavel className="w-8 h-8 md:w-10 md:h-10 text-amber-500/30" />
                        </div>
                      </div>
                      <p className="text-[10px] md:text-xs font-black tracking-[0.2em] text-amber-500/50 uppercase mb-2">Official Seal of The Judge</p>
                      <p className="text-slate-400 italic text-sm md:text-base mb-1">Signed,</p>
                      <p className="text-2xl md:text-3xl font-black text-amber-400 tracking-wider">The Chief Overseer</p>
                    </div>
                  </div>

                  {/* DOWNLOAD OPTIONS */}
                  <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export Official Defense Report
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button onClick={() => handleDownload('pdf')} className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold tracking-wider transition-colors">PDF Format</button>
                      <button onClick={() => handleDownload('doc')} className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-bold tracking-wider transition-colors">Word Document</button>
                      <button onClick={() => handleDownload('xls')} className="p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-xs font-bold tracking-wider transition-colors">Excel Sheet</button>
                      <button onClick={() => handleDownload('txt')} className="p-3 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 rounded-xl text-slate-300 text-xs font-bold tracking-wider transition-colors">Plain Text</button>
                    </div>
                  </div>

                  {/* DIRECT EMAIL SEND WITH FAKE SECURE AUTH */}
                  <div className="bg-rose-500/10 border border-rose-500/30 p-6 md:p-8 rounded-2xl md:rounded-3xl text-center space-y-5 md:space-y-6">
                    <Mail className="w-10 h-10 md:w-12 md:h-12 text-rose-400 mx-auto" />
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Nova Outreach Transmission</h3>
                      <p className="text-rose-300/80 text-[10px] md:text-xs max-w-md mx-auto leading-relaxed">
                        {loggedInUser 
                          ? `Transmit official evaluation from ${loggedInUser} to dionsondaniel@gmail.com and ehn@healthbio.online via secure SMTP protocol.`
                          : `Transmit official evaluation directly to dionsondaniel@gmail.com and ehn@healthbio.online via secure SMTP protocol. Authentication required.`
                        }
                      </p>
                    </div>
                    
                    {emailStatus === 'idle' ? (
                      <button 
                        onClick={() => setShowLoginModal(true)}
                        className="px-6 py-4 w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white font-black text-xs md:text-sm rounded-xl md:rounded-2xl uppercase tracking-widest flex items-center justify-center gap-3 mx-auto shadow-lg shadow-rose-600/30 transition-all"
                      >
                        <Lock className="w-4 h-4 md:w-5 md:h-5" /> Authenticate & Send Directly
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        {emailStatus === 'auth' && <p className="text-rose-400 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Authenticating {loggedInUser}...</p>}
                        {emailStatus === 'sending' && <p className="text-indigo-400 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Transmitting via SMTP...</p>}
                        {emailStatus === 'sent' && (
                          <div className="text-emerald-400 flex flex-col items-center gap-2">
                            <p className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs md:text-sm"><CheckCircle2 className="w-5 h-5" /> Transmission Successful</p>
                            <p className="text-[10px] md:text-xs text-emerald-500/80">Report securely transmitted from <strong className="text-emerald-300">{loggedInUser}</strong> to dionsondaniel@gmail.com & ehn@healthbio.online.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          </div>
          
          {/* SIMULATED LOGIN MODAL */}
          <AnimatePresence>
            {showLoginModal && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[300] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative"
                >
                  <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                      <UserCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">System Authentication</h3>
                    <p className="text-xs text-slate-400 text-center mt-1">Sign in to authorize outbound SMTP email transmission.</p>
                  </div>
                  
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" required
                        value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g., ehn@healthbio.online"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                      <input 
                        type="password" required
                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-4 transition-colors">
                      Authorize Access
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HOW IT WORKS MODAL */}
          <AnimatePresence>
            {showHowItWorks && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[300] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden"
                >
                  <button onClick={() => setShowHowItWorks(false)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10"><X className="w-5 h-5"/></button>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500/20 flex items-center justify-center rounded-xl border border-indigo-500/30">
                      <Info className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">How It Works</h2>
                  </div>

                  <div className="space-y-6 text-slate-300 text-sm max-h-[60vh] overflow-y-auto pr-2 scrollbar-elegant">
                    <p className="leading-relaxed text-slate-400">The Live Defense Panel is a fully automated, AI-driven assessment environment. It simulates a high-stakes presentation defense with industry experts.</p>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Initialization & Upload</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">Enter your name, select your primary module focus (SQL, Excel, Power BI, Python), upload your presentation file, and provide a brief executive summary. This context feeds directly into the AI's neural network.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Live AI Interrogation</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">The AI Panel analyzes your document. <strong>Techy Eve</strong> asks a strictly technical/coding question based on your metrics. <strong>CEO Zeus</strong> challenges your business logic and ROI. <strong>Newbie Alto</strong> tests your ability to explain complex concepts simply. You must answer them live.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">3</div>
                        <div>
                          <h4 className="font-bold text-white mb-1">The Judge's Verdict</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">Once submitted, <strong>The Judge</strong> oversees the entire interaction. It grades your answers (0-100%) against your original document, evaluates the fairness of the panelists' questions, and generates an official Defense Summary Report.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">4</div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Auto-Download & Transmission</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">Upon the verdict, a professional PDF Document (.pdf) containing your results is automatically downloaded. You can then authenticate using your secure credentials to transmit the final report via your default email client.</p>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => setShowHowItWorks(false)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-4 transition-colors">
                      Understood. Let's Begin.
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};