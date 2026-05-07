
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UploadCloud, File as FileIcon, Play, Terminal, Briefcase, HelpCircle, 
  CheckCircle2, Sparkles, Loader2, Table, BarChart3, Code2, Database, ShieldCheck, Info, ArrowRight
} from 'lucide-react';
import { Learner } from '../types';

interface AILivePanelPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  learners: Learner[];
}

const PANELISTS = [
  { id: 'Eve', name: 'Techy Eve', role: 'Lead Technical Architect', icon: Terminal, color: 'text-cyan-400', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.4)]', bg: 'bg-cyan-950/50', border: 'border-cyan-500/50' },
  { id: 'Zeus', name: 'CEO Zeus', role: 'Chief Executive Officer', icon: Briefcase, color: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]', bg: 'bg-amber-950/50', border: 'border-amber-500/50' },
  { id: 'Alto', name: 'Newbie Alto', role: 'Business Associate', icon: HelpCircle, color: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.4)]', bg: 'bg-emerald-950/50', border: 'border-emerald-500/50' },
  { id: 'Leo', name: 'Data Leo', role: 'Senior Data Scientist', icon: BarChart3, color: 'text-purple-400', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]', bg: 'bg-purple-950/50', border: 'border-purple-500/50' },
  { id: 'Max', name: 'QA Max', role: 'Compliance & QA Lead', icon: ShieldCheck, color: 'text-rose-400', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]', bg: 'bg-rose-950/50', border: 'border-rose-500/50' }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MODULE_OPTIONS = [
  { id: 'SQL', label: 'SQL Architecture', icon: Database },
  { id: 'Excel', label: 'Advanced Excel', icon: Table },
  { id: 'PowerBI', label: 'Power BI Dashboarding', icon: BarChart3 },
  { id: 'Python', label: 'Python Analytics', icon: Code2 },
];

type AgentId = 'eve' | 'zeus' | 'alto' | 'leo' | 'max';
type Difficulty = 'Easy' | 'Intermediate' | 'Hard';

export const AILivePanelPractice: React.FC<AILivePanelPracticeProps> = ({ isOpen, onClose, learners }) => {
  const [stage, setStage] = useState<'intro' | 'upload' | 'qna' | 'grading'>('intro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>('Aura');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState<string>('gemini-3-flash-preview');

  const [presenterName, setPresenterName] = useState('');
  const [presentationTopic, setPresentationTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('SQL');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<{ data: string, mimeType: string } | null>(null);

  const [generatedQuestions, setGeneratedQuestions] = useState<Record<AgentId, string> | null>(null);
  const [answers, setAnswers] = useState<Record<AgentId, string>>({ eve: '', zeus: '', alto: '', leo: '', max: '' });
  const [qnaOrder, setQnaOrder] = useState<AgentId[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  const [finalReport, setFinalReport] = useState<string>('');

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

  useEffect(() => {
    if (isOpen) {
      setStage('intro');
      setActiveSpeaker('Aura');
      setPresenterName('');
      setPresentationTopic('');
      setSelectedModule('SQL');
      setDifficulty('Easy');
      setUploadedFile(null);
      setFileBase64(null);
      setGeneratedQuestions(null);
      setAnswers({ eve: '', zeus: '', alto: '', leo: '', max: '' });
      setQnaOrder([]);
      setCurrentQIndex(0);
      setFinalReport('');
      setShowHowItWorks(false);
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

  const callAI = async (prompt: string, speakerId: string, includeFile: boolean = false): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "⚠️ API Key missing.";
    
    setActiveSpeaker(speakerId);
    let responseText = "";
    const parts: any[] = [{ text: prompt }];
    const validMimeTypes = ['application/pdf', 'text/plain', 'text/csv', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (includeFile && fileBase64 && validMimeTypes.includes(fileBase64.mimeType)) {
      parts.push({ inlineData: { data: fileBase64.data, mimeType: fileBase64.mimeType } });
    }

    const priorityModels = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    const modelChain = Array.from(new Set([activeModel, ...priorityModels, ...availableModels]));

    for (const model of modelChain) {
      let attempt = 0;
      let modelSuccess = false;
      while (attempt < 2) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.3 } })
          });
          if (!res.ok) {
            if (res.status === 429) break; 
            if (res.status === 503 && attempt === 0) { await delay(1500); attempt++; continue; } 
            break;
          }
          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          modelSuccess = true;
          if (activeModel !== model) setActiveModel(model);
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

  const processPresentation = async () => {
    if (!presenterName || (!presentationTopic && !uploadedFile)) return;
    setIsProcessing(true);
    setActiveSpeaker('Nexus');
    await delay(1500); 
    setActiveSpeaker('System');

    const diffGuide = 
      difficulty === 'Easy' ? "Keep questions very simple, basic, and encouraging. Focus on general definitions and obvious conclusions." :
      difficulty === 'Intermediate' ? "Ask standard, thought-provoking questions that require a good understanding of the data and methodology." :
      "Be ruthless, highly technical, and critical. Ask complex edge-cases, pinpoint theoretical flaws, and demand deep business strategy.";

    const prompt = `You are generating 5 distinct questions for a live ${selectedModule} presentation defense.
    Presenter: ${presenterName}
    Difficulty Mode: ${difficulty.toUpperCase()}. ${diffGuide}
    Topic/Summary: ${presentationTopic || 'Refer entirely to the attached document.'}
    
    Act as these 5 characters and write ONE specific question each:
    1. Techy Eve: Asks about the specific coding/tool usage of ${selectedModule}.
    2. CEO Zeus: Asks about the ROI, main business goal, or executive-level metric.
    3. Alto: Asks a friendly, non-technical summarizing question (e.g. favorite part, biggest lesson).
    4. Data Leo: Asks about the analytical methodology, data cleaning, or statistical approach.
    5. QA Max: Asks about data security, validation, edge cases, or potential errors.
    
    Return EXACTLY a raw JSON object with keys "eve", "zeus", "alto", "leo", and "max". Do not use markdown wrappers.`;

    const response = await callAI(prompt, 'Panel', true); 
    
    try {
      if (response.includes("⚠️ Neural failure")) throw new Error("API Chain Failed.");
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON structure found.");
      
      const parsed = JSON.parse(match[0]);
      setGeneratedQuestions({
        eve: parsed.eve || `How did you use ${selectedModule} technically here?`,
        zeus: parsed.zeus || "What is the main business benefit?",
        alto: parsed.alto || "What was the easiest part to understand?",
        leo: parsed.leo || "How did you ensure your data was clean and accurate?",
        max: parsed.max || "What steps did you take to validate this data to prevent errors?"
      });
    } catch (e) {
      setGeneratedQuestions({
        eve: `How did you use ${selectedModule} technically here?`,
        zeus: `What is the main business benefit?`,
        alto: `What was the easiest part to understand?`,
        leo: `How did you ensure your data was clean and accurate?`,
        max: `What steps did you take to validate this data to prevent errors?`
      });
    }

    const agents: AgentId[] = ['eve', 'zeus', 'alto', 'leo', 'max'];
    const shuffled = [...agents].sort(() => Math.random() - 0.5);
    
    setQnaOrder(shuffled);
    setCurrentQIndex(0);
    setStage('qna');
    setIsProcessing(false);
    
    const firstAgent = shuffled[0];
    setActiveSpeaker(firstAgent.charAt(0).toUpperCase() + firstAgent.slice(1));
  };

  const handleNextQuestion = () => {
    const activeAgent = qnaOrder[currentQIndex];
    if (!answers[activeAgent]) return;

    if (currentQIndex < 4) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      const nextAgent = qnaOrder[nextIndex];
      setActiveSpeaker(nextAgent.charAt(0).toUpperCase() + nextAgent.slice(1));
    } else {
      submitAnswersAndGrade(true);
    }
  };

  const submitAnswersAndGrade = async (useFile: boolean = true) => {
    setIsProcessing(true);
    setActiveSpeaker('System');

    const prompt = `You are evaluating a PRACTICE live ${selectedModule} data presentation defense (${difficulty} Mode).
    Presenter: ${presenterName}
    
    TRANSCRIPT OF DEFENSE:
    Eve's Q: ${generatedQuestions?.eve} | A: ${answers.eve}
    Zeus's Q: ${generatedQuestions?.zeus} | A: ${answers.zeus}
    Alto's Q: ${generatedQuestions?.alto} | A: ${answers.alto}
    Leo's Q: ${generatedQuestions?.leo} | A: ${answers.leo}
    Max's Q: ${generatedQuestions?.max} | A: ${answers.max}
    
    INSTRUCTIONS:
    1. Grade the presenter out of 100%. Adjust strictness based on ${difficulty} mode.
    2. Provide a constructive Practice Verdict. Tell them what they did well and what they need to study.
    Format output as a short Professional Verdict Report. Do NOT include a signature block.`;

    let report = await callAI(prompt, 'Judge', useFile);
    if (useFile && report.includes('⚠️')) {
      report = await callAI(prompt, 'Judge', false);
    }

    setFinalReport(report);
    setStage('grading');
    setIsProcessing(false);
    setActiveSpeaker('Nova');
  };

  const renderQuestionBox = (agentId: AgentId, isActive: boolean) => {
    const config = {
      eve: { name: 'Techy Eve', icon: Terminal, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500', textColors: 'text-cyan-50', placeholder: 'Technical explanation...' },
      zeus: { name: 'CEO Zeus', icon: Briefcase, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500', textColors: 'text-amber-50', placeholder: 'Business answer...' },
      alto: { name: 'Alto', icon: HelpCircle, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500', textColors: 'text-emerald-50', placeholder: 'Simple summary...' },
      leo: { name: 'Data Leo', icon: BarChart3, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500', textColors: 'text-purple-50', placeholder: 'Analytical methodology...' },
      max: { name: 'QA Max', icon: ShieldCheck, color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500', textColors: 'text-rose-50', placeholder: 'Validation steps...' }
    }[agentId];
    
    const Icon = config.icon;

    return (
      <motion.div 
        key={agentId}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`bg-slate-800/50 border ${config.border} rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-lg relative overflow-hidden transition-all duration-500 ${isActive ? 'ring-1 ring-white/10' : 'opacity-60 grayscale-[30%]'}`}
      >
        <div className={`absolute top-0 left-0 w-2 h-full ${config.bg}`} />
        <h3 className={`${config.color} font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 mb-3 md:mb-4`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" /> {config.name} Asks:
        </h3>
        <p className="text-white text-sm md:text-lg font-medium mb-4 leading-relaxed">
          "{generatedQuestions?.[agentId]}"
        </p>
        
        {isActive ? (
          <textarea 
            value={answers[agentId]} 
            onChange={e => setAnswers({...answers, [agentId]: e.target.value})} 
            rows={3} 
            className={`w-full bg-slate-900 border ${config.border} ${config.textColors} font-medium text-xs md:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-white/50 transition-colors`} 
            placeholder={config.placeholder} 
            autoFocus
          />
        ) : (
          <div className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-300 text-xs md:text-sm rounded-xl px-4 py-3 italic">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Your Answer:</span>
            {answers[agentId]}
          </div>
        )}
      </motion.div>
    );
  };

  const RobotAvatar = ({ agent, active, scale = 1 }: any) => (
    <motion.div 
      animate={{ y: active ? [-5, 5, -5] : 0, scale: active ? scale * 1.1 : scale }}
      transition={{ repeat: active ? Infinity : 0, duration: 3, ease: "easeInOut" }}
      className={`flex flex-col items-center ${active ? '' : 'opacity-40 grayscale'} transition-all duration-500`}
    >
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 md:border-4 ${agent.border} ${agent.bg} ${active ? agent.glow : ''} relative`}>
        {active && <div className="absolute inset-0 rounded-full animate-ping opacity-20 border-2 border-white" />}
        <agent.icon className={`w-6 h-6 md:w-8 md:h-8 ${agent.color}`} />
      </div>
      <div className="mt-2 text-center bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700 hidden sm:block">
        <h4 className={`font-black text-[8px] md:text-[10px] uppercase tracking-widest ${agent.color}`}>{agent.name}</h4>
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
                <ShieldCheck className="text-indigo-400 w-5 h-5 md:w-6 md:h-6 ml-1" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-black text-white tracking-widest uppercase">PRACTICE ARENA</h1>
                <p className="text-[9px] md:text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Safe Simulation Mode</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 md:p-3 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5 md:w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row relative">
            
            {/* 5 PANELISTS DISPLAY */}
            <div className="w-full md:w-[120px] lg:w-[160px] bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-row md:flex-col justify-around items-center gap-2 relative overflow-hidden shrink-0 z-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 via-transparent to-rose-500/5 pointer-events-none" />
              <RobotAvatar agent={PANELISTS[0]} active={activeSpeaker === 'Eve' || stage === 'intro'} />
              <RobotAvatar agent={PANELISTS[1]} active={activeSpeaker === 'Zeus' || stage === 'intro'} />
              <RobotAvatar agent={PANELISTS[2]} active={activeSpeaker === 'Alto' || stage === 'intro'} />
              <RobotAvatar agent={PANELISTS[3]} active={activeSpeaker === 'Leo' || stage === 'intro'} />
              <RobotAvatar agent={PANELISTS[4]} active={activeSpeaker === 'Max' || stage === 'intro'} />
            </div>

            {/* INTERACTIVE STAGE AREA */}
            <div className="flex-1 p-4 md:p-10 overflow-y-auto scrollbar-elegant relative z-20">
              
              {/* STAGE 0: INTRO */}
              {stage === 'intro' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center py-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-500/10 rounded-full border border-indigo-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] mb-8">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-8">Training Simulation</h2>
                  
                  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl text-slate-300 text-sm md:text-base leading-relaxed mb-8 shadow-inner w-full">
                    Welcome to the Practice Arena. You will face <strong>5 virtual panelists</strong>. This is a secure environment to test your knowledge without official grading or email reporting. 
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center w-full">
                    <button onClick={() => setStage('upload')} className="flex-1 md:flex-none px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest transition-transform hover:scale-105 shadow-xl shadow-indigo-500/20 text-sm">
                      Start Practice
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 1: UPLOAD */}
              {stage === 'upload' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-6 md:space-y-8 py-4">
                  <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-6">
                    <UploadCloud className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                    <h2 className="text-xl md:text-3xl font-black text-white uppercase">Practice Setup</h2>
                  </div>

                  <div className="space-y-5 md:space-y-6">
                    
                    {/* DIFFICULTY SELECTOR */}
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Difficulty Mode</label>
                      <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {(['Easy', 'Intermediate', 'Hard'] as Difficulty[]).map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={`py-3 md:py-4 rounded-xl border font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${
                              difficulty === lvl 
                                ? lvl === 'Easy' ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                  : lvl === 'Intermediate' ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                  : 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

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
                      <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Presenter Name</label>
                      <input type="text" value={presenterName} onChange={e => setPresenterName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-sm md:text-base rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" placeholder="Your Name" />
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileIcon className="w-3 h-3" /> Presentation File (PDF / TXT / Images)
                      </label>
                      <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl p-6 md:p-8 text-center hover:bg-slate-800 transition-colors relative cursor-pointer">
                        <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.txt,image/*" />
                        <UploadCloud className="w-8 h-8 md:w-12 md:h-12 text-slate-500 mx-auto mb-3 md:mb-4" />
                        <p className="text-slate-300 font-bold text-sm md:text-base">{uploadedFile ? uploadedFile.name : "Drag & Drop or Click to Browse"}</p>
                      </div>
                    </div>

                    <button 
                      onClick={processPresentation} 
                      disabled={isProcessing || !presenterName}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black rounded-xl uppercase tracking-widest text-xs md:text-sm transition-colors flex items-center justify-center gap-3"
                    >
                      {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Mock Defense...</> : "Start Practice Defense"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: PROGRESSIVE Q&A */}
              {stage === 'qna' && generatedQuestions && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 md:p-4 rounded-xl flex items-center justify-between text-indigo-400 mb-4 md:mb-8">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                      <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">{difficulty} Difficulty Simulation Active.</p>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest bg-indigo-500/20 px-2 py-1 rounded">QUESTION {currentQIndex + 1}/5</span>
                  </div>

                  <div className="space-y-6">
                    {qnaOrder.slice(0, currentQIndex + 1).map((agent, idx) => 
                      renderQuestionBox(agent, idx === currentQIndex)
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-800">
                    <button 
                      onClick={handleNextQuestion} 
                      disabled={isProcessing || !answers[qnaOrder[currentQIndex]]?.trim()}
                      className={`w-full py-4 md:py-5 font-black text-xs md:text-sm rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                        currentQIndex < 4 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                      } disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none`}
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing Results...</>
                      ) : currentQIndex < 4 ? (
                        <>Submit Answer <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <><CheckCircle2 className="w-5 h-5" /> Finish Practice</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: GRADING */}
              {stage === 'grading' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4 text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-500/10 rounded-full border-2 border-emerald-500/50 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-6">
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">Practice Complete</h2>
                  <p className="text-emerald-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-10">Feedback for {presenterName}</p>
                  
                  <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 md:p-10 shadow-inner font-serif text-slate-200 whitespace-pre-wrap leading-relaxed text-sm md:text-base text-left">
                    {finalReport}
                  </div>

                  <button onClick={onClose} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl mt-8 transition-colors uppercase tracking-widest text-sm">
                    Return to Dashboard
                  </button>
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};