// src/components/AIAgents.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, UserCheck, Mail, Gavel, 
  Send, Sparkles, Loader2, Zap, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ExternalLink, Users, Activity
} from 'lucide-react';
import { OverallMetrics, Learner, TransformedAttendance, TransformedPractice, TransformedProject } from '../types';

interface AIAgentsProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  projectData: TransformedProject[];
}

type AgentType = 'Aura' | 'Nexus' | 'Nova' | 'Judge';

const AGENTS =[
  { id: 'Aura', name: 'Aura', role: 'Data Analyst', icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { id: 'Nexus', name: 'Nexus', role: 'Attendance Monitor', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'Nova', name: 'Nova', role: 'Outreach & Email', icon: Mail, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { id: 'Judge', name: 'The Judge', role: 'Chief Overseer', icon: Gavel, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AIAgents: React.FC<AIAgentsProps> = ({ isOpen, onClose, metrics, learners, attendanceData, practiceData, projectData }) => {
  const [activeAgent, setActiveAgent] = useState<AgentType>('Aura');
  const [query, setQuery] = useState('');
  const[chatHistory, setChatHistory] = useState<{role: 'user'|'agent', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentOutput, setAgentOutput] = useState<string>('');
  
  // Nova specific state
  const [novaTargetCohort, setNovaTargetCohort] = useState<string>('');
  const [draftedEmails, setDraftedEmails] = useState<{name: string, email: string, module: string, subject: string, body: string}[]>([]);

  // Real-time Agent Stats Tracking for The Judge
  const [agentStats, setAgentStats] = useState<Record<string, { runs: number, totalTimeMs: number, errors: number }>>({
    Aura: { runs: 0, totalTimeMs: 0, errors: 0 },
    Nexus: { runs: 0, totalTimeMs: 0, errors: 0 },
    Nova: { runs: 0, totalTimeMs: 0, errors: 0 },
  });

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState<string>('gemini-3-flash-preview');
  const [isSwitchingModel, setIsSwitchingModel] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Extract unique cohorts for Nova's target selector
  const availableCohorts = useMemo(() => {
    const cohorts = Array.from(new Set(learners.map(l => l.COHORT_NO).filter(Boolean)));
    return cohorts.sort((a, b) => parseInt(a) - parseInt(b));
  }, [learners]);

  useEffect(() => {
    // Default Nova to the latest active cohort
    if (availableCohorts.length > 0 && !novaTargetCohort) {
      setNovaTargetCohort(availableCohorts[availableCohorts.length - 1]);
    }
  }, [availableCohorts, novaTargetCohort]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Reset states when switching agents
  useEffect(() => {
    setAgentOutput('');
    setDraftedEmails([]);
    setIsLoading(false);
  }, [activeAgent]);

  // Fetch available API models on mount to build the dynamic fallback chain
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

  // --- AI ENGINE WITH SILENT, DYNAMIC AUTO-FALLBACK ---
  const callAI = async (prompt: string, agentName: string): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined') {
      return `⚠️ **[${agentName}] SYSTEM ERROR:** Neural link disconnected. Missing API Key configuration.`;
    }
    
    const startTime = Date.now();
    let success = false;
    let responseText = "";

    // Build the ultimate fallback chain:
    // 1. Start with the currently active model (defaults to gemini-3-flash-preview)
    // 2. Add highly-capable known fallbacks
    // 3. Append all remaining models dynamically fetched from the API
    const priorityModels =['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    const modelChain = Array.from(new Set([activeModel, ...priorityModels, ...availableModels]));

    for (const model of modelChain) {
      let attempt = 0;
      const maxRetries = 1; // Only retry once per model on 503 before switching models
      let modelSuccess = false;

      while (attempt <= maxRetries) {
        try {
          if (model !== activeModel) setIsSwitchingModel(true);

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contents: [{ parts:[{ text: prompt }] }],
              generationConfig: { temperature: 0.1 } // Very low temp for factual responses
            })
          });
          
          if (!res.ok) {
            if (res.status === 429) {
              console.warn(`[Engine] ${model} quota exceeded. Switching pathway...`);
              break; // Break while loop, instantly proceed to next model in chain
            }
            if (res.status === 503 && attempt < maxRetries) {
              console.warn(`[Engine] ${model} overloaded. Retrying...`);
              await delay(1500);
              attempt++;
              continue;
            }
            break; // 400, 404, or unrecoverable error -> skip to next model
          }

          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Response logic processing failed.";
          modelSuccess = true;
          success = true;

          // Auto-Latch: If we used a fallback model and it succeeded, make it the new default to save time later
          if (activeModel !== model) {
            setActiveModel(model);
          }
          setIsSwitchingModel(false);
          break; // Success! Exit while loop.
        } catch (error) {
          if (attempt < maxRetries) {
            await delay(1000);
            attempt++;
            continue;
          }
          break; // Network failure, proceed to next model
        }
      }

      if (modelSuccess) break; // Success! Exit the outer model chain loop.
    }

    setIsSwitchingModel(false);

    if (!success) {
      responseText = `⚠️ **[${agentName}] OVERLOAD:** All neural pathways are currently congested or have reached their strict quota limits. Please stand by and try again shortly.`;
    }

    const endTime = Date.now();
    
    // Update Agent Tracking Stats
    if (agentName !== 'Judge') {
      setAgentStats(prev => ({
        ...prev,
        [agentName]: {
          runs: prev[agentName].runs + 1,
          totalTimeMs: prev[agentName].totalTimeMs + (endTime - startTime),
          errors: prev[agentName].errors + (success ? 0 : 1)
        }
      }));
    }

    return responseText;
  };

  // --- AURA: DEEP DIVE DATA ANALYST ---
  const handleAuraQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const userQ = query;
    setQuery('');
    setChatHistory(prev =>[...prev, { role: 'user', text: userQ }]);
    setIsLoading(true);

    // COMPRESS ALL LEARNERS INTO A "CSV" STRING FOR PERFECT CONTEXT
    const compressedData = learners.map(l => {
      const att = attendanceData.filter(a => a.NAME === l.NAME);
      const prac = practiceData.filter(p => p.NAME === l.NAME);
      const proj = projectData.filter(p => p.NAME === l.NAME);
      
      const avgAtt = att.length ? att.reduce((s, c) => s + c.Attendance_Rate, 0) / att.length : 0;
      const avgPrac = prac.length ? prac.reduce((s, c) => s + c.Rate_of_Submission, 0) / prac.length : 0;
      const avgGpa = proj.length ? proj.reduce((s, c) => s + c.GPA, 0) / proj.length : 0;
      
      return `${l.NAME}|C${l.COHORT_NO}|Att:${avgAtt.toFixed(0)}%|Prac:${avgPrac.toFixed(0)}%|GPA:${(avgGpa*100).toFixed(0)}%`;
    }).join('\n');

    const cohortCounts = learners.reduce((acc, curr) => {
      acc[curr.COHORT_NO] = (acc[curr.COHORT_NO] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const prompt = `You are Aura, an elite AI Data Analyst for the TTSP Program.
    Use the compressed data below to answer the user's query perfectly.
    
    GLOBAL METRICS:
    Total Learners: ${learners.length}
    Avg Attendance: ${metrics.Overall_Attendance_Rate.toFixed(1)}%
    Avg Submissions: ${metrics.Overall_Submission_Rate.toFixed(1)}%
    Cohort Population: ${JSON.stringify(cohortCounts)}
    
    LEARNER DATABASE (Name|Cohort|Attendance|Practice|GPA):
    ${compressedData}

    USER QUERY: "${userQ}"
    
    INSTRUCTIONS: 
    - Search the Learner Database rigorously to answer questions about specific people, top performers, or cohorts.
    - If asked "who is the top performer in cohort X", find the highest GPA in that cohort from the database.
    - Be professional, concise, and act like a sentient data interface. DO NOT say "I don't have access", because the data IS provided above.`;

    const response = await callAI(prompt, 'Aura');
    setChatHistory(prev =>[...prev, { role: 'agent', text: response }]);
    setIsLoading(false);
  };

  // --- NEXUS: DEEP ATTENDANCE CHECK ---
  const handleNexusCheck = async () => {
    setIsLoading(true);
    const lowAtt = attendanceData.filter(d => d.Attendance_Rate < 80).sort((a,b) => a.Attendance_Rate - b.Attendance_Rate).slice(0, 15);
    
    let contextStr = "CRITICAL ATTENDANCE ALERTS:\n";
    lowAtt.forEach(d => contextStr += `- ${d.NAME} (Cohort ${d.COHORT_NO}): ${d.Attendance_Rate.toFixed(1)}% in ${d.MODULE}\n`);

    const prompt = `You are Nexus, an AI Attendance Monitor.
    Review the following critical attendance data:\n${contextStr || 'No critical attendance issues found.'}\n
    Provide a professional summary of the hardest-hit cohorts/modules and suggest 2 direct, actionable steps for the Mentors.`;

    const response = await callAI(prompt, 'Nexus');
    setAgentOutput(response);
    setIsLoading(false);
  };

  // --- NOVA: ACTUAL EMAIL GENERATOR ---
  const handleNovaOutreach = async () => {
    if (!novaTargetCohort) return;
    setIsLoading(true);
    setDraftedEmails([]);
    
    // Filter by the user-selected active cohort
    const missingPrac = practiceData
      .filter(d => d.Rate_of_Submission < 80 && d.COHORT_NO === novaTargetCohort)
      .sort((a,b) => a.Rate_of_Submission - b.Rate_of_Submission)
      .slice(0, 3); // Top 3 worst offenders in this cohort
    
    const targets = missingPrac.map(p => {
      const learner = learners.find(l => l.NAME === p.NAME);
      return {
        name: p.NAME,
        module: p.MODULE,
        rate: p.Rate_of_Submission,
        email: learner?.Email_Add || ''
      };
    }).filter(t => t.email !== '');

    if (targets.length === 0) {
      setAgentOutput(`✅ Automated Scan Complete: No learners in Cohort ${novaTargetCohort} were found with critically low practice submissions and valid email addresses. Processing complete.`);
      setIsLoading(false);
      return;
    }

    const contextStr = targets.map(t => `Name: ${t.name}, Module: ${t.module}, Rate: ${t.rate.toFixed(0)}%`).join('\n');

    const prompt = `You are Nova, an empathetic AI Outreach Coordinator. 
    Write a short, motivating, and highly personalized email for each of these students falling behind in Cohort ${novaTargetCohort}:
    
    ${contextStr}
    
    Return the result EXACTLY as a valid JSON array of objects with "name", "subject", and "body" keys. Do NOT use markdown code blocks (\`\`\`json). Output raw JSON only.
    Example format:[
      {"name": "John Doe", "subject": "Checking in on your progress", "body": "Hi John,..."}
    ]`;

    const response = await callAI(prompt, 'Nova');
    
    try {
      // Powerful JSON extraction regex to prevent Gemini markdown errors
      const match = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!match) throw new Error("No JSON array found in response.");
      
      const parsed = JSON.parse(match[0]);
      
      const mappedEmails = parsed.map((p: any) => {
        const target = targets.find(t => t.name.includes(p.name) || p.name.includes(t.name));
        return {
          name: p.name,
          email: target?.email || 'no-reply@example.com',
          module: target?.module || 'Data Analytics',
          subject: p.subject,
          body: p.body
        };
      });
      
      setDraftedEmails(mappedEmails);
    } catch (e) {
      console.error("Failed to parse Nova JSON", e);
      setAgentOutput("⚠️ Intervention failed. The neural core returned an unparseable communication string. Please try again.\n\nRaw Output:\n" + response);
    }
    
    setIsLoading(false);
  };

  // --- THE JUDGE: REAL METRIC EVALUATION ---
  const handleJudgeEvaluation = async () => {
    setIsLoading(true);

    const calculateStat = (agentName: string) => {
      const s = agentStats[agentName];
      const avgLatency = s.runs > 0 ? (s.totalTimeMs / s.runs / 1000).toFixed(2) + 's' : 'N/A';
      const efficiency = s.runs > 0 ? (((s.runs - s.errors) / s.runs) * 100).toFixed(1) + '%' : 'N/A';
      return `${agentName} -> Runs: ${s.runs}, Avg Latency: ${avgLatency}, Efficiency: ${efficiency}`;
    };

    const prompt = `You are The Judge, an advanced AI overseeing the Data Analytics Program.
    Evaluate the live performance of your sub-agents based on their actual system usage today:
    
    ${calculateStat('Aura')}
    ${calculateStat('Nexus')}
    ${calculateStat('Nova')}
    
    Write a highly dramatic, strict, 3-sentence verdict on their performance. Praise the fastest/most efficient agent, and ruthlessly mock the inactive or slow ones. Do not use markdown bolding.`;
    
    const response = await callAI(prompt, 'Judge');
    setAgentOutput(response);
    setIsLoading(false);
  };

  const getRealLeaderboard = () => {
    return['Aura', 'Nexus', 'Nova'].map(name => {
      const s = agentStats[name];
      return {
        name,
        runs: s.runs,
        speed: s.runs > 0 ? (s.totalTimeMs / s.runs / 1000).toFixed(2) + 's' : '--',
        eff: s.runs > 0 ? (((s.runs - s.errors) / s.runs) * 100).toFixed(1) + '%' : '--'
      };
    }).sort((a, b) => b.runs - a.runs); 
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* SIDEBAR */}
          <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 p-6 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400 w-6 h-6" />
                <h2 className="text-xl font-black text-white tracking-widest uppercase">Neural Core</h2>
              </div>
              <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-elegant">
              {AGENTS.map(agent => {
                const isActive = activeAgent === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setActiveAgent(agent.id as AgentType)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                      isActive 
                        ? `${agent.bg} ${agent.border} shadow-lg` 
                        : 'border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-slate-900 shadow-inner ${isActive ? agent.color : 'text-slate-500'}`}>
                      <agent.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${isActive ? 'text-white' : ''}`}>{agent.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest opacity-60">{agent.role}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="pt-6 border-t border-slate-800 text-center flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Deep DB Link Active
              </div>
              <div className="text-[9px] text-slate-600 font-mono flex items-center gap-1 uppercase tracking-widest">
                <Activity className="w-3 h-3" /> Engine: {activeModel.split('-')[1] || 'Optimized'}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col bg-slate-900 relative overflow-hidden h-full">
            <div className="h-20 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
              {AGENTS.map(a => a.id === activeAgent && (
                <div key={a.id} className="flex items-center gap-3">
                  <a.icon className={`w-8 h-8 ${a.color}`} />
                  <div>
                    <h2 className="text-xl font-black text-white">{a.name}</h2>
                    <p className={`text-xs font-bold uppercase tracking-widest ${a.color}`}>{a.role}</p>
                  </div>
                </div>
              ))}
              <button onClick={onClose} className="hidden md:block p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-elegant relative flex flex-col">
              
              {/* --- AURA (Chat) --- */}
              {activeAgent === 'Aura' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-6 overflow-y-auto pb-4 pr-2 scrollbar-elegant">
                    {chatHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <MessageSquare className="w-16 h-16 opacity-20" />
                        <p className="text-sm font-medium text-center max-w-md">I am tapped into the central database. Ask me anything.<br/><span className="text-xs opacity-70">e.g., "How many students in Cohort 5?" or "Top performers in Cohort 1"</span></p>
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700 shadow-lg'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="p-4 bg-slate-800 rounded-2xl rounded-bl-none border border-slate-700 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                          <span className="text-slate-400 text-sm">
                            {isSwitchingModel ? "Rerouting to alternate neural pathway..." : "Executing deep scan..."}
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleAuraQuery} className="mt-auto relative pt-4 shrink-0">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter operational query..."
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                    />
                    <button type="submit" disabled={!query.trim() || isLoading} className="absolute right-2 top-6 bottom-2 aspect-square bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-900 rounded-xl flex items-center justify-center transition-colors">
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              )}

              {/* --- NEXUS (Attendance) --- */}
              {activeAgent === 'Nexus' && (
                <div className="h-full flex flex-col">
                  {!agentOutput && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <UserCheck className="w-12 h-12 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Automated Attendance Scan</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Nexus scans raw records to pinpoint exactly who is failing attendance and maps out an intervention strategy.</p>
                      </div>
                      <button onClick={handleNexusCheck} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105">
                        <Zap className="w-5 h-5" /> Initiate Diagnostic
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-y-auto h-full scrollbar-elegant">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-emerald-400">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="font-bold uppercase tracking-widest text-sm">
                            {isSwitchingModel ? "Rerouting neural pathway..." : "Processing Diagnostics..."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-2 mb-4">
                            <CheckCircle2 className="w-5 h-5" /> Diagnostics Complete
                          </div>
                          {agentOutput}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- NOVA (Outreach) --- */}
              {activeAgent === 'Nova' && (
                <div className="h-full flex flex-col">
                  {!isLoading && draftedEmails.length === 0 && !agentOutput ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                        <Mail className="w-12 h-12 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Smart Email Outreach</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Nova searches active cohorts for missing submissions, drafts personalized intervention emails, and connects directly to your Mail client.</p>
                      </div>
                      
                      {/* Target Cohort Selector */}
                      <div className="flex flex-col items-center gap-2 bg-slate-800 border border-slate-700 p-4 rounded-2xl mt-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-3 h-3" /> Target Cohort
                        </label>
                        <select 
                          value={novaTargetCohort}
                          onChange={(e) => setNovaTargetCohort(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-rose-500 cursor-pointer"
                        >
                          {availableCohorts.length > 0 ? availableCohorts.map(c => (
                            <option key={c} value={c}>Cohort {c}</option>
                          )) : (
                            <option value="">No Data</option>
                          )}
                        </select>
                      </div>

                      <button onClick={handleNovaOutreach} disabled={!novaTargetCohort} className="px-8 py-4 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-2xl shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all hover:scale-105">
                        <Sparkles className="w-5 h-5" /> Generate Action Plans
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-elegant space-y-4">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-rose-400">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="font-bold uppercase tracking-widest text-sm">
                            {isSwitchingModel ? "Rerouting neural pathway..." : "Synthesizing Communications..."}
                          </p>
                        </div>
                      ) : (
                        <>
                          {agentOutput && (
                             <div className="p-4 bg-slate-800 border border-slate-700 text-white rounded-xl mb-4 whitespace-pre-wrap">
                                {agentOutput}
                             </div>
                          )}
                          {draftedEmails.map((email, i) => (
                            <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-bold text-white">{email.name}</h4>
                                  <p className="text-xs text-rose-400 font-mono">{email.email}</p>
                                </div>
                                <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] uppercase font-bold tracking-widest rounded-lg">
                                  {email.module}
                                </span>
                              </div>
                              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                                <p className="text-sm font-bold text-slate-300 mb-2 border-b border-slate-800 pb-2">Subj: {email.subject}</p>
                                <p className="text-sm text-slate-400 whitespace-pre-wrap">{email.body}</p>
                              </div>
                              <a 
                                href={`mailto:${email.email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" /> Transmit via Mail Client
                              </a>
                            </div>
                          ))}
                          
                          <button onClick={() => {setAgentOutput(''); setDraftedEmails([]);}} className="w-full mt-4 py-3 text-sm text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-bold">
                            Reset Outreach Module
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- THE JUDGE (Real Leaderboard) --- */}
              {activeAgent === 'Judge' && (
                <div className="h-full flex flex-col overflow-y-auto scrollbar-elegant pr-2">
                  <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(245,158,11,0.1)] mb-6 shrink-0">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                      <ShieldCheck className="text-amber-500" /> Live Agent Efficiency Leaderboard
                    </h3>
                    <div className="space-y-4">
                      {getRealLeaderboard().map((stat, i) => (
                        <div key={stat.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400 text-sm">
                              #{i + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{stat.name}</h4>
                              <p className="text-xs text-slate-500">Tasks Executed: <span className="text-amber-400 font-bold">{stat.runs}</span></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-right w-full sm:w-auto justify-between sm:justify-end">
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> Avg Latency</p>
                              <p className="font-mono text-white">{stat.speed}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-end gap-1"><Zap className="w-3 h-3" /> Success Rate</p>
                              <p className="font-mono text-emerald-400 font-bold">{stat.eff}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 min-h-[150px] bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 relative flex flex-col justify-center items-center text-center">
                    {!agentOutput && !isLoading ? (
                      <button onClick={handleJudgeEvaluation} className="px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/10">
                        Compute System Verdict
                      </button>
                    ) : isLoading ? (
                      <div className="flex flex-col items-center gap-4 text-amber-500 py-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="font-bold uppercase tracking-widest text-xs">
                          {isSwitchingModel ? "Rerouting neural pathway..." : "Evaluating Operations..."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center mb-2">
                          <AlertTriangle className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-amber-100/90 text-lg leading-relaxed italic max-w-2xl font-serif">
                          "{agentOutput}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};