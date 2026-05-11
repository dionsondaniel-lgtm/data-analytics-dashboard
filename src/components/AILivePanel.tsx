import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UploadCloud, File as FileIcon, Play, Terminal, Briefcase, HelpCircle, 
  Gavel, Mail, Sparkles, Loader2, Download, Table, BarChart3, Code2, Database, ShieldCheck, Lock, CheckCircle2, UserCircle, Info, FileText, RefreshCw, ArrowRight, Award, Users, Clock, Timer, AlertTriangle
} from 'lucide-react';
import { Learner } from '../types';
import { LiveBadgesArena } from './LiveBadgesArena';

interface AILivePanelProps {
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

export const AILivePanel: React.FC<AILivePanelProps> = ({ isOpen, onClose, learners }) => {
  const [stage, setStage] = useState<'intro' | 'upload' | 'qna' | 'grading'>('intro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>('Aura');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const [showBadgesArena, setShowBadgesArena] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState<string>('gemini-3-flash-preview');

  // TEAM / MEMBER STATES
  const [teamName, setTeamName] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('5TH');
  const [selectedPresenters, setSelectedPresenters] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

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
  
  const [emailStatus, setEmailStatus] = useState<'idle' | 'auth' | 'generating' | 'sent'>('idle');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');

  // TIMER STATES
  const [hasPresented, setHasPresented] = useState(false);
  const [showPresentationTimer, setShowPresentationTimer] = useState(false);
  const [presentationTimeLeft, setPresentationTimeLeft] = useState(15 * 60); 
  const [qnaTimeLeft, setQnaTimeLeft] = useState(10 * 60); 
  const [isQnaActive, setIsQnaActive] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Derived Cohorts and Learners
  const availableCohorts = useMemo(() => Array.from(new Set(learners.map(l => l.COHORT_NO).filter(Boolean))), [learners]);
  const filteredLearners = useMemo(() => learners.filter(l => l.COHORT_NO === selectedCohort), [learners, selectedCohort]);

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
      setTeamName('');
      setSelectedPresenters([]);
      setSelectedMembers([]);
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
      setEmailStatus('idle');
      setShowLoginModal(false);
      setShowHowItWorks(false);
      setHasPresented(false);
      setShowPresentationTimer(false);
      setPresentationTimeLeft(15 * 60);
      setQnaTimeLeft(10 * 60);
      setIsQnaActive(false);
      setIsTimedOut(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPresentationTimer && presentationTimeLeft > 0) {
      interval = setInterval(() => setPresentationTimeLeft(prev => prev - 1), 1000);
    } else if (presentationTimeLeft === 0 && showPresentationTimer) {
      finishPresentation();
    }
    return () => clearInterval(interval);
  }, [showPresentationTimer, presentationTimeLeft]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === 'qna' && isQnaActive && qnaTimeLeft > 0) {
      interval = setInterval(() => setQnaTimeLeft(prev => prev - 1), 1000);
    } else if (qnaTimeLeft === 0 && isQnaActive) {
      handleForceTimeout();
    }
    return () => clearInterval(interval);
  }, [stage, isQnaActive, qnaTimeLeft]);

  const startPresentation = () => {
    if (!teamName) return alert("Please enter the Group Number/Team Name first!");
    setShowPresentationTimer(true);
  };

  const finishPresentation = () => {
    setShowPresentationTimer(false);
    setHasPresented(true);
    setPresentationTimeLeft(15 * 60); 
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  const togglePresenter = (name: string) => {
    setSelectedPresenters(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const toggleMember = (name: string) => {
    setSelectedMembers(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
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
    if (!teamName || (!presentationTopic && !uploadedFile)) return;
    setIsProcessing(true);
    
    setActiveSpeaker('Nexus');
    await delay(1500); 
    setActiveSpeaker('System');

    const diffGuide = 
      difficulty === 'Easy' ? "Keep questions very simple, basic, and encouraging. Avoid complex queries." :
      difficulty === 'Intermediate' ? "Ask standard, thought-provoking questions that require a good understanding of the topic." :
      "Be ruthless, highly technical, and critical. Ask complex edge-cases and pinpoint theoretical flaws.";

    const prompt = `You are generating 5 distinct questions for a live ${selectedModule} presentation defense.
    Group/Team: ${teamName}
    Presenters: ${selectedPresenters.join(', ')}
    Difficulty Mode: ${difficulty.toUpperCase()}. ${diffGuide}
    Abstract/Summary Provided: ${presentationTopic || 'Refer entirely to the attached document.'}
    
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
    setIsQnaActive(true);

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
      setIsQnaActive(false); 
      submitAnswersAndGrade(true, false);
    }
  };

  const handleForceTimeout = () => {
    setIsQnaActive(false);
    setIsTimedOut(true);
    submitAnswersAndGrade(true, true);
  };

  const submitAnswersAndGrade = async (useFile: boolean = true, forceTimeout: boolean = false) => {
    setIsProcessing(true);
    setActiveSpeaker('System');

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeoutNote = forceTimeout 
      ? `\n\nCRITICAL NOTE: THE PRESENTER RAN OUT OF TIME! The 10-minute limit expired before they could answer all questions. You MUST penalize their grade for poor time management.` 
      : "";

    const prompt = `You are evaluating a live ${selectedModule} data presentation defense (${difficulty} Mode).
    
    INSTRUCTIONS: 
    1. Grade the presenter out of 100% based on the exact rubric below. Adjust strictness based on ${difficulty} mode and Time Management.
    2. Provide a detailed verdict referencing specific metrics and answers.
    3. Evaluate the Panelists: Who asked the best question? Who was too harsh?
    4. Format the output as a professional Defense Summary Report. Do NOT use markdown bolding wrappers (**).
    5. You MUST start your response EXACTLY with this header block format:
    
    Defense Summary Report
    Date: ${currentDate}
    Group Number/Team Name: ${teamName}
    Presenter(s): ${selectedPresenters.length > 0 ? selectedPresenters.join(', ') : 'None specified'}
    Member(s): ${selectedMembers.length > 0 ? selectedMembers.join(', ') : 'None specified'}
    Topic: ${presentationTopic || 'Live Data Presentation Defense'}
    
    ${timeoutNote}
    
    6. Right before the end of your report, you MUST include this EXACT RUBRIC block filled out with your scores (0-100 integer) and a very short remark (2-4 words). Keep the '|' separators exact:
    
    [RUBRIC]
    Business purpose|[SCORE]|10%|[REMARK]
    The process of building the panel and using the data|[SCORE]|10%|[REMARK]
    Data analysis|[SCORE]|25%|[REMARK]
    Presentation design|[SCORE]|20%|[REMARK]
    Presenting conclusions and recommendations|[SCORE]|20%|[REMARK]
    General Impression|[SCORE]|15%|[REMARK]
    [END RUBRIC]
    
    TRANSCRIPT OF DEFENSE:
    Eve's Q: ${generatedQuestions?.eve} | A: ${answers.eve || '[UNANSWERED - TIME OUT]'}
    Zeus's Q: ${generatedQuestions?.zeus} | A: ${answers.zeus || '[UNANSWERED - TIME OUT]'}
    Alto's Q: ${generatedQuestions?.alto} | A: ${answers.alto || '[UNANSWERED - TIME OUT]'}
    Leo's Q: ${generatedQuestions?.leo} | A: ${answers.leo || '[UNANSWERED - TIME OUT]'}
    Max's Q: ${generatedQuestions?.max} | A: ${answers.max || '[UNANSWERED - TIME OUT]'}`;

    let report = await callAI(prompt, 'Judge', useFile);
    if (useFile && report.includes('⚠️')) {
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

  // PARSER: Extracts clean text and the Rubric Array
  const parseRubric = (report: string) => {
    let cleanText = report;
    const rubricData: any[] = [];
    let finalScore = 0;
    
    if (report.includes('[RUBRIC]') && report.includes('[END RUBRIC]')) {
      const rubricStr = report.split('[RUBRIC]')[1].split('[END RUBRIC]')[0].trim();
      cleanText = report.replace(/\[RUBRIC\][\s\S]*\[END RUBRIC\]/, '').trim();
      
      const lines = rubricStr.split('\n').map(l => l.trim()).filter(l => l);
      let total = 0;
      
      lines.forEach(line => {
        const parts = line.split('|');
        if (parts.length >= 4) {
          const score = parseInt(parts[1]) || 0;
          const weightStr = parts[2].replace('%','');
          const weight = (parseInt(weightStr) || 0) / 100;
          total += score * weight;
          
          rubricData.push({
            category: parts[0].trim(),
            score: score,
            weight: parts[2].trim(),
            remark: parts[3].trim()
          });
        }
      });
      finalScore = Math.round(total);
    }
    return { cleanText, rubricData, finalScore };
  };

  const generatePDFBase64 = async (reportContent: string): Promise<string> => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    const { cleanText, rubricData, finalScore } = parseRubric(reportContent);
    const cleanedReport = cleanText.replace(/========================================[\s\S]*The Chief Overseer/g, '').trim();
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const splitText = doc.splitTextToSize(cleanedReport, 180);
    splitText.forEach((line: string) => {
      if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 6;
    });
    
    y += 15;
    
    // DRAW PDF TABLE ONLY IF RUBRIC WAS GENERATED
    if (rubricData.length > 0) {
      if (y > pageHeight - 100) { doc.addPage(); y = 20; }
      const cw = [70, 30, 40, 40]; 
      const tw = 180; 
      
      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, tw, 8, 'S');
      doc.setFont('helvetica', 'bold');
      doc.text("Prepare Data Visualization Leading to Data Analytics Level III", margin + 2, y + 6);
      y += 8;
      
      doc.rect(margin, y, tw, 8, 'S');
      doc.text("Panelist: The Chief Overseer", margin + 2, y + 6);
      y += 8;
      
      doc.setFillColor(32, 55, 100); // Navy Blue
      doc.rect(margin, y, tw/2, 8, 'FD');
      doc.rect(margin + tw/2, y, tw/2, 8, 'FD');
      doc.setTextColor(255, 255, 255);
      doc.text("Group number", margin + (tw/4), y + 6, { align: 'center' });
      doc.text(teamName, margin + tw/2 + (tw/4), y + 6, { align: 'center' });
      y += 8;
      
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0);
      doc.rect(margin, y, tw, 8, 'S');
      doc.text("Names of participants", margin + 2, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(selectedPresenters.join(', ').substring(0, 50), margin + 60, y + 6);
      y += 8;
      
      doc.rect(margin, y, tw, 8, 'S');
      doc.setFont('helvetica', 'bold');
      doc.text("Subject of the summary project", margin + 2, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text((presentationTopic || 'Live Defense').substring(0, 50), margin + 65, y + 6);
      y += 8;
      
      doc.setFillColor(32, 55, 100);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      doc.rect(margin, y, cw[0], 10, 'FD');
      doc.rect(margin+cw[0], y, cw[1], 10, 'FD');
      doc.rect(margin+cw[0]+cw[1], y, cw[2], 10, 'FD');
      doc.rect(margin+cw[0]+cw[1]+cw[2], y, cw[3], 10, 'FD');
      
      doc.text("Category", margin + cw[0]/2, y + 6, { align: 'center' });
      doc.text("Judge score\n(0-100)", margin + cw[0] + cw[1]/2, y + 4, { align: 'center' });
      doc.text("Percentage\nweighting", margin + cw[0] + cw[1] + cw[2]/2, y + 4, { align: 'center' });
      doc.text("Remarks", margin + cw[0] + cw[1] + cw[2] + cw[3]/2, y + 6, { align: 'center' });
      y += 10;
      
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      
      rubricData.forEach(r => {
        doc.rect(margin, y, cw[0], 8, 'S');
        doc.rect(margin+cw[0], y, cw[1], 8, 'S');
        doc.rect(margin+cw[0]+cw[1], y, cw[2], 8, 'S');
        doc.rect(margin+cw[0]+cw[1]+cw[2], y, cw[3], 8, 'S');
        
        doc.text(r.category.substring(0, 35), margin + 2, y + 6);
        doc.text(r.score.toString(), margin + cw[0] + cw[1]/2, y + 6, { align: 'center' });
        doc.text(r.weight.toString(), margin + cw[0] + cw[1] + cw[2]/2, y + 6, { align: 'center' });
        doc.text(r.remark.substring(0, 20), margin + cw[0] + cw[1] + cw[2] + 2, y + 6);
        y += 8;
      });
      
      doc.setFont('helvetica', 'bold');
      doc.rect(margin, y, cw[0], 8, 'S');
      doc.rect(margin+cw[0], y, cw[1], 8, 'S');
      doc.rect(margin+cw[0]+cw[1], y, cw[2], 8, 'S');
      doc.rect(margin+cw[0]+cw[1]+cw[2], y, cw[3], 8, 'S');
      doc.text("Final score", margin + 2, y + 6);
      doc.text(finalScore.toString() + "%", margin + cw[0] + cw[1]/2, y + 6, { align: 'center' });
      doc.text("100%", margin + cw[0] + cw[1] + cw[2]/2, y + 6, { align: 'center' });
      y += 20;
    }

    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    
    doc.setDrawColor(200);
    doc.line(margin, y, 195, y);
    y += 15;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(204, 153, 0); 
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
    
    const dataUri = doc.output('datauristring');
    return dataUri.split(',')[1];
  };

  const generateHTMLTable = () => {
    const { rubricData, finalScore } = parseRubric(finalReport);
    if (rubricData.length === 0) return '';

    let rows = rubricData.map(r => `
      <tr>
        <td style="border: 1px solid #333; padding: 5px;">${r.category}</td>
        <td style="border: 1px solid #333; padding: 5px; text-align: center;">${r.score}</td>
        <td style="border: 1px solid #333; padding: 5px; text-align: center;">${r.weight}</td>
        <td style="border: 1px solid #333; padding: 5px;">${r.remark}</td>
      </tr>
    `).join('');

    return `
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; margin-top: 20px;">
        <tr><td colspan="4" style="border: 1px solid #333; padding: 5px; font-weight: bold;">Prepare Data Visualization Leading to Data Analytics Level III</td></tr>
        <tr><td colspan="4" style="border: 1px solid #333; padding: 5px; font-weight: bold;">Panelist: The Chief Overseer</td></tr>
        <tr style="background-color: #203764; color: white;">
          <td colspan="2" style="border: 1px solid #333; padding: 5px; font-weight: bold; text-align: center;">Group number</td>
          <td colspan="2" style="border: 1px solid #333; padding: 5px; font-weight: bold; text-align: center;">${teamName}</td>
        </tr>
        <tr>
          <td colspan="2" style="border: 1px solid #333; padding: 5px; font-weight: bold;">Names of participants</td>
          <td colspan="2" style="border: 1px solid #333; padding: 5px;">${selectedPresenters.join(', ')}</td>
        </tr>
        <tr>
          <td colspan="2" style="border: 1px solid #333; padding: 5px; font-weight: bold;">Subject of the summary project</td>
          <td colspan="2" style="border: 1px solid #333; padding: 5px;">${presentationTopic || 'Live Defense'}</td>
        </tr>
        <tr style="background-color: #203764; color: white; text-align: center; font-weight: bold;">
          <td style="border: 1px solid #333; padding: 5px;">Category</td>
          <td style="border: 1px solid #333; padding: 5px;">Judge score (0-100)</td>
          <td style="border: 1px solid #333; padding: 5px;">Percentage weighting</td>
          <td style="border: 1px solid #333; padding: 5px;">Remarks</td>
        </tr>
        ${rows}
        <tr style="font-weight: bold;">
          <td style="border: 1px solid #333; padding: 5px;">Final score</td>
          <td style="border: 1px solid #333; padding: 5px; text-align: center;">${finalScore}%</td>
          <td style="border: 1px solid #333; padding: 5px; text-align: center;">100%</td>
          <td style="border: 1px solid #333; padding: 5px;"></td>
        </tr>
      </table>
    `;
  };

  const handleDownload = (format: string, reportContent: string = finalReport) => {
    if (!reportContent || reportContent.includes('⚠️')) return;
    
    const signatureText = `\n\n========================================\nOFFICIAL SEAL OF THE JUDGE\nSigned,\nThe Chief Overseer`;
    const { cleanText } = parseRubric(reportContent);
    const filename = `${teamName.replace(/\s+/g, '_')}_Defense_Report`;
    
    if (format === 'txt') {
      const fullContent = cleanText + signatureText;
      const blob = new Blob([fullContent], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.txt`; a.click();
    } else if (format === 'doc' || format === 'xls') {
      const htmlTable = generateHTMLTable();
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'></head><body>
        ${cleanText.replace(/\n/g, '<br>')}
        ${htmlTable}
        <br><br><b>OFFICIAL SEAL OF THE JUDGE</b><br><i>Signed,</i><br><h2>The Chief Overseer</h2>
        </body></html>
      `;
      const mime = format === 'doc' ? 'application/msword' : 'application/vnd.ms-excel';
      const blob = new Blob([htmlContent], { type: mime });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.${format}`; a.click();
    } else if (format === 'pdf') {
      // Auto-downloads via the base64 gen to reuse code
      generatePDFBase64(reportContent).then(b64 => {
        const byteCharacters = atob(b64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.pdf`; a.click();
      });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    
    setShowLoginModal(false);
    setLoggedInUser(loginEmail);
    setEmailStatus('auth');
    
    await delay(1500); 
    setEmailStatus('generating');
    
    const pdfBase64 = await generatePDFBase64(finalReport);
    const boundary = "----=_Part_Nova_System_Boundary";
    const subject = `[CONFIDENTIAL VERDICT] Final Defense Assessment - ${teamName}`;
    const to = "dionsondaniel@gmail.com, ehn@healthbio.online";
    const filename = `${teamName.replace(/\s+/g, '_')}_Defense_Report.pdf`;
    
    const emailBody = `The AI Panel has concluded its high-stakes live assessment of ${teamName}'s presentation.

We rigorously tested their technical architecture, business logic, and clarity under intense pressure. The final verdict contains critical insights regarding their performance. 

Did they crack under pressure, or did they successfully defend their metrics? The verdict might surprise you.

Please find the official PDF dossier attached to reveal the final score and comprehensive evaluation.

Automated by TTSP Neural Core.
Securely routed by: ${loginEmail}`;

    const emlContent = `To: ${to}
Subject: ${subject}
X-Unsent: 1
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit

${emailBody}

--${boundary}
Content-Type: application/pdf; name="${filename}"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="${filename}"

${pdfBase64.match(/.{1,76}/g)?.join('\n') || pdfBase64}
--${boundary}--`;

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Draft_Verdict_${teamName.replace(/\s+/g, '_')}.eml`;
    a.click();

    await delay(1000);
    setEmailStatus('sent');
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
            {answers[agentId] || <span className="text-rose-400">Time Out - Unanswered</span>}
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

  const { cleanText, rubricData, finalScore } = parseRubric(finalReport);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6 bg-slate-950/95 backdrop-blur-2xl">
        <style>{`
          .scrollbar-sleek::-webkit-scrollbar { width: 4px; }
          .scrollbar-sleek::-webkit-scrollbar-track { background: transparent; }
          .scrollbar-sleek::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
          .scrollbar-sleek::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        `}</style>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="w-full max-w-7xl h-full md:h-[95vh] bg-slate-900 border border-slate-700 shadow-[0_0_100px_rgba(99,102,241,0.2)] md:rounded-[2.5rem] overflow-hidden flex flex-col relative"
        >
          {/* HEADER */}
          <div className="h-16 md:h-20 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-slate-950 z-20 shrink-0 relative">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/20 flex items-center justify-center rounded-xl md:rounded-2xl border border-indigo-500/30 shrink-0">
                <Play className="text-indigo-400 w-5 h-5 md:w-6 md:h-6 ml-1" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-lg md:text-2xl font-black text-white tracking-widest uppercase whitespace-nowrap">Live Defense Panel</h1>
                <p className="text-[9px] md:text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Adaptive Protocol Active</p>
              </div>
            </div>

            {/* TOP CENTER MODERN ANIMATED BUTTON FOR BADGES ARENA */}
            <div className="flex-1 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBadgesArena(true)}
                className="relative group flex items-center gap-2 px-4 md:px-6 py-2 bg-slate-900 border border-slate-700 hover:border-pink-500/50 rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(244,114,182,0.1)] hover:shadow-[0_0_30px_rgba(244,114,182,0.3)] z-10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Award className="w-4 h-4 md:w-5 md:h-5 text-pink-400 group-hover:text-purple-300 transition-colors z-10" />
                <span className="text-[10px] md:text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-widest transition-colors z-10 whitespace-nowrap">
                  Live Badges Arena
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500 animate-pulse" />
              </motion.button>
            </div>

            <div className="flex-1 flex justify-end">
              <button onClick={onClose} className="p-2 md:p-3 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors shrink-0">
                <X className="w-5 h-5 md:w-6 h-6" />
              </button>
            </div>
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
            <div className="flex-1 p-4 md:p-10 overflow-y-auto scrollbar-sleek relative z-20">
              
              {/* STAGE 0: INTRO */}
              {stage === 'intro' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto w-full text-center">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-indigo-500/30 transform rotate-12 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                    <Sparkles className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Aura's Guidelines</h2>
                  <p className="text-slate-400 font-medium max-w-2xl mx-auto mb-12">Welcome to the Live Defense. Follow the sequence below.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                    {[
                      { step: "1. Team Setup", desc: "Select members & presenters.", icon: Users, color: "text-blue-400" },
                      { step: "2. Present (15m)", desc: "Strict timer for your pitch.", icon: Clock, color: "text-emerald-400" },
                      { step: "3. AI Defense (10m)", desc: "Upload PDF & Face 5 Panelists.", icon: ShieldCheck, color: "text-rose-400" }
                    ].map((item, i) => (
                      <motion.div key={item.step} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl">
                        <item.icon className={`w-10 h-10 mb-4 ${item.color}`} />
                        <p className="text-white font-black text-lg uppercase tracking-widest mb-2">{item.step}</p>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 p-8 rounded-3xl mb-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative w-full text-left overflow-hidden">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-pink-500/50 shrink-0 bg-slate-950 flex items-center justify-center relative shadow-[0_0_30px_rgba(244,114,182,0.4)]">
                      <img src="/gemma-badges.gif" alt="Gemma Badges" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                        <Award className="text-pink-400" /> Introducing Gemma
                      </h3>
                      <p className="text-pink-200/80 text-sm md:text-base leading-relaxed mb-4">
                        After your grueling defense, <strong>Gemma</strong> will host the Live Badges Arena! The audience can vote for awards like <span className="text-yellow-400 font-bold">Query Master</span> before The Judge delivers the final verdict.
                      </p>
                      <button onClick={() => setStage('upload')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest transition-transform hover:scale-105 shadow-xl shadow-indigo-500/20 text-sm flex items-center gap-2">
                        Enter the Arena <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 1: UPLOAD & TIMERS */}
              {stage === 'upload' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-6 md:space-y-8 py-4 relative z-10">
                  <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-6">
                    <UploadCloud className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                    <h2 className="text-xl md:text-3xl font-black text-white uppercase">Upload Presentation</h2>
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

                    {/* GROUP INPUT & CHECKBOXES */}
                    <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cohort</label>
                          <select 
                            value={selectedCohort} 
                            onChange={(e) => setSelectedCohort(e.target.value)} 
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-indigo-500"
                          >
                            <option value="">Select</option>
                            {availableCohorts.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Group Number/Team Name</label>
                          <input 
                            type="text" value={teamName} onChange={e => setTeamName(e.target.value)} 
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" 
                            placeholder="e.g., Jack Daniel Team" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Presenter(s)</label>
                          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-2 h-32 overflow-y-auto scrollbar-sleek space-y-1">
                            {filteredLearners.length > 0 ? filteredLearners.map(l => (
                              <label key={`p-${l.NAME}`} className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedPresenters.includes(l.NAME)} onChange={() => togglePresenter(l.NAME)} className="accent-emerald-500" />
                                <span className="text-xs text-slate-300 truncate">{l.NAME}</span>
                              </label>
                            )) : <p className="text-xs text-slate-500 italic p-2">Select a valid cohort</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Member(s)</label>
                          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-2 h-32 overflow-y-auto scrollbar-sleek space-y-1">
                            {filteredLearners.length > 0 ? filteredLearners.map(l => (
                              <label key={`m-${l.NAME}`} className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedMembers.includes(l.NAME)} onChange={() => toggleMember(l.NAME)} className="accent-indigo-500" />
                                <span className="text-xs text-slate-300 truncate">{l.NAME}</span>
                              </label>
                            )) : <p className="text-xs text-slate-500 italic p-2">Select a valid cohort</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={startPresentation} 
                      disabled={hasPresented}
                      className={`w-full py-4 border-2 font-black rounded-xl uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 ${
                        hasPresented 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-none' 
                          : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02]'
                      }`}
                    >
                      {hasPresented ? <><CheckCircle2 className="w-5 h-5" /> Presentation Completed</> : <><Clock className="w-5 h-5" /> Start 15-Minute Presentation</>}
                    </button>

                    <div className={!hasPresented ? 'opacity-40 grayscale pointer-events-none transition-all duration-500' : 'transition-all duration-500'}>
                      <div className="mb-6">
                        <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FileIcon className="w-3 h-3" /> Presentation File (PDF / TXT / Images)
                        </label>
                        <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl p-6 md:p-8 text-center hover:bg-slate-800 transition-colors relative cursor-pointer">
                          <input type="file" onChange={handleFileUpload} disabled={!hasPresented} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" accept=".pdf,.txt,image/*" />
                          <UploadCloud className="w-8 h-8 md:w-12 md:h-12 text-slate-500 mx-auto mb-3 md:mb-4" />
                          <p className="text-slate-300 font-bold text-sm md:text-base">{uploadedFile ? uploadedFile.name : "Drag & Drop or Click to Browse"}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Executive Summary / Key Focus Areas
                        </label>
                        <textarea value={presentationTopic} onChange={e => setPresentationTopic(e.target.value)} disabled={!hasPresented} rows={3} className="w-full bg-slate-900 border border-slate-700 text-white text-sm md:text-base rounded-xl px-4 py-3 focus:border-indigo-500 outline-none resize-none placeholder-slate-600 disabled:cursor-not-allowed" placeholder="Specify your main goals, revenue trends, or key metrics here." />
                      </div>

                      <button 
                        onClick={processPresentation} 
                        disabled={isProcessing || !teamName || (!presentationTopic && !uploadedFile) || !hasPresented}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black rounded-xl uppercase tracking-widest text-xs md:text-sm transition-colors flex items-center justify-center gap-3"
                      >
                        {isProcessing ? <><Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Nexus Validating Attendance & Syncing AI...</> : "Start Defense (10m Limit)"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: PROGRESSIVE Q&A */}
              {stage === 'qna' && generatedQuestions && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4 relative">
                  
                  {/* 10 MINUTE Q&A TIMER HUD */}
                  <div className="sticky top-0 z-50 mb-8 flex justify-center">
                    <div className={`flex items-center gap-4 px-6 py-3 rounded-full border shadow-2xl backdrop-blur-md transition-colors ${
                      qnaTimeLeft < 60 ? 'bg-rose-950/80 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse' : 'bg-indigo-950/80 border-indigo-500 text-indigo-400'
                    }`}>
                      <Timer className="w-6 h-6" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Defense Timer</span>
                        <span className="text-xl md:text-2xl font-black font-mono leading-none">{formatTime(qnaTimeLeft)}</span>
                      </div>
                      {qnaTimeLeft < 60 && <AlertTriangle className="w-6 h-6 ml-2 text-rose-500" />}
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 md:p-4 rounded-xl flex items-center justify-between text-emerald-400 mb-4 md:mb-8">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                      <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">Nexus Log: {difficulty} Mode Interrogation Active.</p>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest bg-emerald-500/20 px-2 py-1 rounded">PANEL {currentQIndex + 1}/5</span>
                  </div>

                  <div className="space-y-6">
                    {qnaOrder.slice(0, currentQIndex + 1).map((agent, idx) => 
                      renderQuestionBox(agent, idx === currentQIndex)
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-800 pb-20">
                    <button 
                      onClick={handleNextQuestion} 
                      disabled={isProcessing || !answers[qnaOrder[currentQIndex]]?.trim()}
                      className={`w-full py-4 md:py-5 font-black text-xs md:text-sm rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                        currentQIndex < 4 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' 
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                      } disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none`}
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> The Judge is calculating scores...</>
                      ) : currentQIndex < 4 ? (
                        <>Submit Answer & Continue <ArrowRight className="w-4 h-4 md:w-5 md:h-5" /></>
                      ) : (
                        <><Gavel className="w-5 h-5 md:w-6 md:h-6" /> Face The Judge</>
                      )}
                    </button>
                  </div>
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
                    <p className="text-amber-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">Final Evaluation for {teamName}</p>
                    
                    {isTimedOut && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                        <AlertTriangle className="w-4 h-4" /> Time Expired - Forced Submission
                      </div>
                    )}
                    
                    {finalReport && !finalReport.includes('⚠️') && (
                      <p className="text-slate-400 text-xs mt-2 italic flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto-downloaded PDF Document</p>
                    )}
                    
                    <div className="flex justify-center mt-6">
                       <button onClick={() => submitAnswersAndGrade(false, isTimedOut)} disabled={isProcessing} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          Recalculate Verdict
                       </button>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-inner font-serif flex flex-col relative">
                    <div className="text-slate-200 whitespace-pre-wrap leading-relaxed text-sm md:text-base mb-8">
                      {cleanText}
                    </div>

                    {/* ELEGANT UI TABLE MATCHING PDF SCREENSHOT */}
                    {rubricData.length > 0 && (
                      <div className="bg-white rounded p-4 text-black font-sans text-xs md:text-sm mt-4 border border-slate-300 shadow-xl overflow-x-auto">
                         <div className="border border-slate-400 min-w-[600px]">
                             {/* Row 1 */}
                             <div className="p-2 border-b border-slate-400 font-bold text-sm md:text-base bg-white text-black">
                               Prepare Data Visualization Leading to Data Analytics Level III
                             </div>
                             {/* Row 2 */}
                             <div className="p-2 border-b border-slate-400 font-bold bg-white text-black">
                               Panelist: The Chief Overseer
                             </div>
                             {/* Row 3 - Navy Blue Header */}
                             <div className="flex border-b border-slate-400 bg-[#1e3a5f] text-white">
                                 <div className="w-1/2 p-2 font-bold text-center border-r border-slate-400">Group number</div>
                                 <div className="w-1/2 p-2 font-bold text-center">{teamName}</div>
                             </div>
                             {/* Row 4 */}
                             <div className="flex border-b border-slate-400 bg-white text-black">
                                 <div className="w-1/2 p-2 font-bold border-r border-slate-400">Names of participants</div>
                                 <div className="w-1/2 p-2">{selectedPresenters.join(', ')}</div>
                             </div>
                             {/* Row 5 */}
                             <div className="flex border-b border-slate-400 bg-white text-black">
                                 <div className="w-1/2 p-2 font-bold border-r border-slate-400">Subject of the summary project</div>
                                 <div className="w-1/2 p-2">{presentationTopic || 'Live Defense'}</div>
                             </div>
                             {/* Columns Headers */}
                             <div className="flex bg-[#1e3a5f] text-white font-bold text-center border-b border-slate-400">
                                 <div className="w-[40%] p-2 border-r border-slate-400">Category</div>
                                 <div className="w-[20%] p-2 border-r border-slate-400">Judge score<br/>(0-100)</div>
                                 <div className="w-[20%] p-2 border-r border-slate-400">Percentage<br/>weighting</div>
                                 <div className="w-[20%] p-2">Remarks</div>
                             </div>
                             {/* Data Rows */}
                             {rubricData.map((r, i) => (
                               <div key={i} className="flex border-b border-slate-400 bg-white text-black">
                                 <div className="w-[40%] p-2 border-r border-slate-400">{r.category}</div>
                                 <div className="w-[20%] p-2 text-center border-r border-slate-400 flex items-center justify-center">{r.score}</div>
                                 <div className="w-[20%] p-2 text-center border-r border-slate-400 flex items-center justify-center">{r.weight}</div>
                                 <div className="w-[20%] p-2">{r.remark}</div>
                               </div>
                             ))}
                             {/* Final Row */}
                             <div className="flex font-bold bg-white text-black">
                                 <div className="w-[40%] p-2 border-r border-slate-400">Final score</div>
                                 <div className="w-[20%] p-2 text-center border-r border-slate-400 flex items-center justify-center">{finalScore}%</div>
                                 <div className="w-[20%] p-2 text-center border-r border-slate-400 flex items-center justify-center">100%</div>
                                 <div className="w-[20%] p-2"></div>
                             </div>
                         </div>
                      </div>
                    )}
                    
                    <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center md:items-end text-center md:text-right">
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

                  {/* RESTORED: DIRECT EMAIL SEND WITH FAKE SECURE AUTH */}
                  <div className="bg-rose-500/10 border border-rose-500/30 p-6 md:p-8 rounded-2xl md:rounded-3xl text-center space-y-5 md:space-y-6">
                    <Mail className="w-10 h-10 md:w-12 md:h-12 text-rose-400 mx-auto" />
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Nova Outreach Transmission</h3>
                      <p className="text-rose-300/80 text-[10px] md:text-xs max-w-md mx-auto leading-relaxed">
                        {loggedInUser 
                          ? `Transmit official evaluation from ${loggedInUser} to dionsondaniel@gmail.com and ehn@healthbio.online via secure SMTP protocol.`
                          : `Auto-generate a secure email draft containing the finalized PDF evaluation. Authentication required.`
                        }
                      </p>
                    </div>
                    
                    {emailStatus === 'idle' ? (
                      <button 
                        onClick={() => setShowLoginModal(true)}
                        className="px-6 py-4 w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white font-black text-xs md:text-sm rounded-xl md:rounded-2xl uppercase tracking-widest flex items-center justify-center gap-3 mx-auto shadow-lg shadow-rose-600/30 transition-all"
                      >
                        <Lock className="w-4 h-4 md:w-5 md:h-5" /> Authenticate & Generate Draft
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        {emailStatus === 'auth' && <p className="text-rose-400 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Authenticating {loggedInUser}...</p>}
                        {emailStatus === 'generating' && <p className="text-indigo-400 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Packaging EML Draft with Natively Embedded PDF...</p>}
                        {emailStatus === 'sent' && (
                          <div className="text-emerald-400 flex flex-col items-center gap-2">
                            <p className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs md:text-sm"><CheckCircle2 className="w-5 h-5" /> Transmission Prepared</p>
                            <p className="text-[10px] md:text-xs text-emerald-500/80 max-w-sm leading-relaxed">A specialized <strong>.eml</strong> file has been downloaded. Click it to open your default Mail app with the PDF automatically attached!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

            </div>
          </div>
          
          {/* 15-MINUTE PRESENTATION FULL-SCREEN OVERLAY MODAL */}
          <AnimatePresence>
            {showPresentationTimer && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[400] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
              >
                <div className="absolute top-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-4 border border-emerald-500/30">
                    <Clock className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Live Presentation Active</h2>
                  <p className="text-emerald-400 font-bold mt-2 uppercase tracking-widest">{teamName}</p>
                </div>

                <motion.div 
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="text-[6rem] md:text-[10rem] font-black font-mono text-white tracking-tighter drop-shadow-[0_0_50px_rgba(16,185,129,0.3)] my-10"
                >
                  {formatTime(presentationTimeLeft)}
                </motion.div>

                <div className="absolute bottom-10 flex flex-col items-center">
                  <p className="text-slate-400 mb-6 font-medium text-sm">Presenters: Share your screen and begin your pitch.</p>
                  <button 
                    onClick={finishPresentation}
                    className="px-8 py-4 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-white font-black rounded-full uppercase tracking-widest transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  >
                    Finish Early / Proceed to Defense
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIMULATED LOGIN MODAL */}
          <AnimatePresence>
            {showLoginModal && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
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

          {/* NESTED HIGH Z-INDEX COMPONENT FOR LIVE BADGE ARENA */}
          {showBadgesArena && (
            <div className="fixed inset-0 z-[9999]">
              <LiveBadgesArena onClose={() => setShowBadgesArena(false)} />
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};