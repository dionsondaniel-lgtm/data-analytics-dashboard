import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { 
  Trophy, Award, Sparkles, Star, Users, ChevronLeft, Loader2, 
  BarChart3, Terminal, Code2, ShieldCheck, Zap, X, 
  CheckCircle2, Briefcase, HelpCircle, Gavel, Mic, Volume2, 
  VolumeX, Download, Calendar, Activity, Edit3, UserCircle, 
  Info, Crown, Radio, PartyPopper, Clock, Rocket, Archive, Lock, Key, FileText, CheckSquare
} from 'lucide-react';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

interface LiveBadgesArenaProps {
  onClose: () => void;
}

interface Team {
  id: string;
  team_name: string;
}

const BADGES =[
  { id: 'query_master', name: 'Query Master', desc: 'Best overall SQL knowledge, accuracy & command of the language', rarity: 'Legendary', icon: Zap, color: 'text-yellow-400', outerShape: 'clip-path-hexagon bg-yellow-950/40 border-yellow-500/50', innerShape: 'clip-path-hexagon bg-yellow-500/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' },
  { id: 'data_storyteller', name: 'Data Storyteller', desc: 'Best use of visuals, insights & narrative to bring data to life', rarity: 'Epic', icon: BarChart3, color: 'text-teal-400', outerShape: 'rounded-full bg-teal-950/40 border-teal-500/50', innerShape: 'rounded-full bg-teal-500/20 border-teal-400 border-dashed shadow-[0_0_15px_rgba(45,212,191,0.5)]' },
  { id: 'the_debugger', name: 'The Debugger', desc: 'Outstanding ability to find, fix and explain data anomalies', rarity: 'Rare', icon: Terminal, color: 'text-rose-400', outerShape: 'rounded-[2rem] bg-rose-950/40 border-rose-500/50', innerShape: 'rounded-[1.5rem] bg-rose-500/20 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]' },
  { id: 'clean_code', name: 'Clean Code Award', desc: 'Most organized, readable, and scalable syntax formatting', rarity: 'Epic', icon: Code2, color: 'text-emerald-400', outerShape: 'rotate-45 rounded-2xl bg-emerald-950/40 border-emerald-500/50', innerShape: 'rounded-xl bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
  { id: 'crowd_fav', name: 'Crowd Favorite', desc: 'Voted #1 most engaging presentation by the live audience', rarity: 'Mythic', icon: Users, color: 'text-pink-400', outerShape: 'rounded-full bg-pink-950/40 border-pink-500/50', innerShape: 'rounded-full bg-pink-500/20 border-pink-400 border-double border-4 shadow-[0_0_20px_rgba(244,114,182,0.6)]' },
  { id: 'optimizer', name: 'The Optimizer', desc: 'Highly efficient queries & calculations reducing process time', rarity: 'Rare', icon: Sparkles, color: 'text-purple-400', outerShape: 'clip-path-shield bg-purple-950/40 border-purple-500/50', innerShape: 'clip-path-shield bg-purple-500/20 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
  { id: 'iron_defense', name: 'Iron Defense', desc: 'Flawless and confident Q&A response under intense pressure', rarity: 'Legendary', icon: ShieldCheck, color: 'text-slate-300', outerShape: 'clip-path-heavy-shield bg-slate-800/60 border-slate-500/50', innerShape: 'clip-path-heavy-shield bg-slate-600/40 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.5)]' },
  { id: 'best_teammates', name: 'Best Teammates', desc: 'Outstanding collaboration, synergy, and equal participation', rarity: 'Rare', icon: Star, color: 'text-orange-400', outerShape: 'rounded-full bg-orange-950/40 border-orange-500/50', innerShape: 'rounded-full bg-orange-500/20 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]' }
];

const AI_AGENTS = ['Techy Eve', 'CEO Zeus', 'Alto', 'Data Leo', 'QA Max', 'The Judge'];

export const LiveBadgesArena: React.FC<LiveBadgesArenaProps> = ({ onClose }) => {
  const [stage, setStage] = useState<'processing' | 'results'>('processing');
  const [dbTeams, setDbTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [recentFeed, setRecentFeed] = useState<any[]>([]);
  const [teamRankings, setTeamRankings] = useState<any[]>([]);

  // Modals
  const [showGuide, setShowGuide] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showGrandResults, setShowGrandResults] = useState(false);

  // Vault States
  const [showVaultAuth, setShowVaultAuth] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [vaultPass, setVaultPass] = useState('');
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultBucket, setVaultBucket] = useState<'verdicts' | 'grand_results'>('verdicts');
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);
  const [selectedVaultFiles, setSelectedVaultFiles] = useState<string[]>([]);

  // Voting Countdown State
  const [showTimerSetup, setShowTimerSetup] = useState(false);
  const [votingMinutes, setVotingMinutes] = useState(2);
  const [votingTimeLeft, setVotingTimeLeft] = useState(0);
  const [isVotingActive, setIsVotingActive] = useState(false);

  // Voting States
  const [voteAlias, setVoteAlias] = useState('');
  const [voteTeamId, setVoteTeamId] = useState('');
  const [voteBadge, setVoteBadge] = useState('');
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [userPastVotes, setUserPastVotes] = useState<any[]>([]);

  // Gemma Audio & Easter Egg State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUFO, setShowUFO] = useState(false);

  const getStartOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const speak = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.3; 
    
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    if (femaleVoice) utterance.voice = femaleVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  // 1. AUTO FETCH & PROCESS ON MOUNT
  useEffect(() => {
    const savedAlias = localStorage.getItem('nova_voter_alias');
    if (savedAlias) setVoteAlias(savedAlias);
    window.speechSynthesis?.getVoices();

    const initializeArena = async () => {
      speak("Welcome to today's Live Badges Arena. Accessing Supabase storage to extract today's official verdicts and initialize the matrix.");
      
      if (supabaseUrl) {
        try {
          const today = getStartOfToday();
          const { data: files } = await supabase.storage.from('verdicts').list();
          
          if (files && files.length > 0) {
            // STRICTLY exclude '.emptyFolderPlaceholder' and other hidden files
            const todayFiles = files.filter(f => 
              f.created_at && 
              f.created_at >= today && 
              !f.name.includes('.emptyFolderPlaceholder') && 
              !f.name.startsWith('.')
            );

            const extractedNames = todayFiles.map(f => f.name.replace(/_Defense_Report/i, '').replace(/\.pdf/i, '').replace(/_[0-9]+$/i, '').replace(/_/g, ' ').trim() || "Unknown Team");
            const uniqueTeams = Array.from(new Set(extractedNames)).filter(name => name.length > 0 && name !== 'Unknown Team');

            const { data: existingDb } = await supabase.from('teams').select('id, team_name');
            let updatedDbTeams = existingDb || [];

            for (const tName of uniqueTeams) {
              let teamInfo = updatedDbTeams.find(t => t.team_name.toLowerCase() === tName.toLowerCase());
              
              if (!teamInfo) {
                const { data: dbCheck } = await supabase.from('teams').select('id, team_name').ilike('team_name', tName).limit(1);
                
                if (dbCheck && dbCheck.length > 0) {
                  teamInfo = dbCheck[0];
                } else {
                  const { data: newData } = await supabase.from('teams').insert([{ team_name: tName, cohort: 'Live Evaluation' }]).select('id, team_name').limit(1);
                  if (newData && newData.length > 0) {
                    teamInfo = newData[0];
                  }
                }
                if (teamInfo && !updatedDbTeams.find(t => t.id === teamInfo!.id)) {
                  updatedDbTeams.push(teamInfo);
                }
              }

              if (teamInfo) {
                 const { data: existingVotes } = await supabase.from('badge_votes').select('id').eq('team_id', teamInfo.id).in('voter_alias', AI_AGENTS).gte('created_at', today);
                 if (!existingVotes || existingVotes.length === 0) {
                    const agentVotes = AI_AGENTS.map(agent => ({
                      voter_alias: agent,
                      voter_type: agent === 'The Judge' ? 'judge' : 'agent',
                      team_id: teamInfo!.id,
                      badge_name: BADGES[Math.floor(Math.random() * BADGES.length)].name
                    }));
                    await supabase.from('badge_votes').insert(agentVotes);
                 }
              }
            }
            
            const activeDbTeams = updatedDbTeams.filter(t => uniqueTeams.some(ut => ut.toLowerCase() === t.team_name.toLowerCase()));
            const uniqueActiveTeams = Array.from(new Map(activeDbTeams.map(t => [t.id, t])).values());
            setDbTeams(uniqueActiveTeams);
          }
        } catch (e) { console.error(e); }
      }
      
      setTimeout(() => setStage('results'), 12000);
    };

    initializeArena();
  },[]);

  // LIVE LEADERBOARD INTERVAL
  useEffect(() => {
    if (stage === 'results') {
      fetchLeaderboard();
      speak("The Live Leaderboard is now active. The AI Panel has cast their votes. Audience, it is your turn to decide the ultimate winners.");
      const interval = setInterval(fetchLeaderboard, 3000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // FETCH PAST VOTES IF MODAL OPEN
  useEffect(() => {
    if (showVoteModal && voteAlias) {
      fetchUserPastVotes(voteAlias);
    }
  }, [showVoteModal, voteAlias]);

  // AUDIENCE VOTING TIMER LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVotingActive && votingTimeLeft > 0) {
      interval = setInterval(() => {
        setVotingTimeLeft(prev => {
          const next = prev - 1;
          if (next === 10) speak("10");
          if (next === 9) speak("9");
          if (next === 8) speak("8");
          if (next === 7) speak("7");
          if (next === 6) speak("6");
          if (next === 5) speak("5");
          if (next === 4) speak("4");
          if (next === 3) speak("3");
          if (next === 2) speak("2");
          if (next === 1) speak("1");
          return next;
        });
      }, 1000);
    } else if (votingTimeLeft === 0 && isVotingActive) {
      setIsVotingActive(false);
      handleGrandAnnounce();
    }
    return () => clearInterval(interval);
  }, [isVotingActive, votingTimeLeft]);

  // UFO EASTER EGG INTERVAL
  useEffect(() => {
    const hasJun = recentFeed.some(f => f.voter_alias.toLowerCase().includes('jun'));
    if (hasJun) {
      setShowUFO(true);
      setTimeout(() => setShowUFO(false), 15000);
      const ufoInterval = setInterval(() => {
        setShowUFO(true);
        setTimeout(() => setShowUFO(false), 15000); 
      }, 1 * 60 * 1000); 
      return () => clearInterval(ufoInterval);
    }
  }, [recentFeed]);

  const fetchUserPastVotes = async (alias: string) => {
    if (!supabaseUrl) return;
    const { data } = await supabase
      .from('badge_votes')
      .select('id, badge_name, team_id')
      .eq('voter_alias', alias)
      .gte('created_at', getStartOfToday()); 
    
    if (data) setUserPastVotes(data);
  };

  const fetchLeaderboard = async () => {
    if (!supabaseUrl) return; 

    try {
      const { data: voteData } = await supabase
        .from('badge_votes')
        .select('team_id, badge_name, voter_alias, created_at')
        .gte('created_at', getStartOfToday())
        .order('created_at', { ascending: false });
        
      const { data: teamData } = await supabase.from('teams').select('id, team_name');

      if (!voteData || !teamData) return;

      const teamMap = new Map(teamData.map((t: any) => [t.id, t.team_name]));
      
      const recent = voteData.slice(0, 15).map(v => ({
        ...v, team_name: teamMap.get(v.team_id) || 'Unknown Team'
      }));
      setRecentFeed(recent);

      const tally: Record<string, Record<string, number>> = {};
      const teamTotalTally: Record<string, number> = {};

      voteData.forEach((row: any) => {
        const tName = teamMap.get(row.team_id) || 'Unknown Team';
        
        if (!tally[row.badge_name]) tally[row.badge_name] = {};
        tally[row.badge_name][tName] = (tally[row.badge_name][tName] || 0) + 1;
        teamTotalTally[tName] = (teamTotalTally[tName] || 0) + 1;
      });

      const newResults = [];
      for (const badge of BADGES) {
        const badgeTally = tally[badge.name];
        if (badgeTally) {
          let maxVotes = 0;
          let winnerTeam = '';
          for (const [team, votes] of Object.entries(badgeTally)) {
            if (votes > maxVotes) {
              maxVotes = votes;
              winnerTeam = team;
            }
          }
          if (winnerTeam) newResults.push({ badge: badge.name, team: winnerTeam, votes: maxVotes });
        }
      }
      setResults(newResults);

      const rankings = Object.entries(teamTotalTally)
        .map(([team, votes]) => ({ team, votes }))
        .sort((a, b) => b.votes - a.votes);
      setTeamRankings(rankings);

    } catch (err) {}
  };

  const startVotingTimer = () => {
    setShowTimerSetup(false);
    setVotingTimeLeft(votingMinutes * 60);
    setIsVotingActive(true);
    speak(`The voting timer is set for ${votingMinutes} minutes. Cast your votes now!`);
  };

  const submitAudienceVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voteAlias || !voteTeamId || !voteBadge) return;

    setIsSubmittingVote(true);
    localStorage.setItem('nova_voter_alias', voteAlias);
    
    try {
      const existingVote = userPastVotes.find(v => v.badge_name === voteBadge);

      if (existingVote) {
        await supabase.from('badge_votes').update({ team_id: voteTeamId, created_at: new Date().toISOString() }).eq('id', existingVote.id);
      } else {
        await supabase.from('badge_votes').insert([{
          voter_alias: voteAlias,
          voter_type: 'audience',
          team_id: voteTeamId,
          badge_name: voteBadge
        }]);
      }

      setVoteSuccess(true);
      fetchLeaderboard();
      fetchUserPastVotes(voteAlias);

      setTimeout(() => {
        setVoteSuccess(false);
        setVoteBadge(''); 
      }, 1500);

    } catch (err) {
      alert("Failed to connect to database.");
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const createGrandResultsPDFBlob = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(255, 105, 180); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("OFFICIAL GRAND RESULTS", pageWidth/2, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("LIVE BADGES ARENA & DEFENSE EVALUATION", pageWidth/2, 30, { align: 'center' });

    y = 55;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date of Event: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;

    // SECTION 1: BADGES
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("I. ACHIEVEMENT BADGES", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 12;

    doc.setFontSize(11);
    if (results.length > 0) {
      results.forEach(r => {
        doc.setFont('helvetica', 'bold');
        doc.text(`Award: ${r.badge}`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Winner: ${r.team} (${r.votes} votes)`, margin + 80, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text("No badges awarded yet.", margin, y);
      y += 8;
    }
    y += 10;

    // SECTION 2: RANKINGS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("II. OVERALL TEAM LEADERBOARD", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 12;

    doc.setFontSize(11);
    if (teamRankings.length > 0) {
      teamRankings.forEach((tr, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`Rank ${idx + 1}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${tr.team}`, margin + 25, y);
        doc.text(`${tr.votes} Total Votes`, margin + 120, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text("No rankings available yet.", margin, y);
      y += 8;
    }

    y += 20;
    doc.setDrawColor(200);
    doc.line(pageWidth/2 - 40, y, pageWidth/2 + 40, y);
    y += 10;
    doc.setFont('times', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text("Certified & Verified by Gemma & The Chief Overseer", pageWidth/2, y, { align: 'center' });

    return doc.output('blob');
  };

  const handleGrandAnnounce = async () => {
    let speech = "Attention everyone! The votes are in. It is time to announce the official Grand Results and crown our champions! ";
    
    if (teamRankings.length > 0) {
      speech += `The overall grand champion is ${teamRankings[0].team} with ${teamRankings[0].votes} points. `;
      for (let i = 1; i < teamRankings.length; i++) {
         speech += `In rank ${i + 1}, we have ${teamRankings[i].team} with ${teamRankings[i].votes} points. `;
      }
    }

    speech += "Before we close, I want to extend a massive thank you to everyone. Thank you to our esteemed AI Panel: Techy Eve, CEO Zeus, Alto, Data Leo, Q A Max, and The Judge. A very special thanks to Mentor Ehn for orchestrating this, and to the brilliant learners of the 5th Cohort for your hard work. And finally, to our amazing audience in the live feed—thank you for your time and for casting your votes. We are truly grateful to have met you all here today. This concludes our broadcast. Have a wonderful day!";

    speak(speech);
    setShowGrandResults(true);

    // Auto-save Grand Results silently to Bucket
    try {
       const pdfBlob = await createGrandResultsPDFBlob();
       const filename = `Grand_Arena_Results_${getLocalDateString()}.pdf`;
       if (supabaseUrl) {
          await supabase.storage.from('grand_results').upload(`today/${filename}`, pdfBlob, { upsert: true });
       }
    } catch (e) {
       console.error("Auto-save failed", e);
    }
  };

  const exportGrandResultsPDF = async () => {
    try {
      const blob = await createGrandResultsPDFBlob();
      const filename = `Grand_Arena_Results_${getLocalDateString()}.pdf`;
      const a = document.createElement('a'); 
      a.href = URL.createObjectURL(blob); 
      a.download = filename; 
      a.click();
    } catch (e) {
      console.error("Native PDF Generation Failed", e);
    }
  };

  const handleEditVote = (badgeName: string) => {
    setVoteBadge(badgeName);
  };

  const handleVaultAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPass === "LED") {
      setShowVaultAuth(false);
      setVaultPass('');
      setShowVault(true);
    } else {
      alert("Invalid Access Code.");
      setVaultPass('');
    }
  };

  const loadVaultFiles = async (bucket: 'verdicts' | 'grand_results') => {
    setVaultBucket(bucket);
    setSelectedVaultFiles([]);
    if (!supabaseUrl) return;
    setVaultLoading(true);
    try {
      const folderPath = bucket === 'grand_results' ? 'today' : '';
      const { data } = await supabase.storage.from(bucket).list(folderPath, { sortBy: { column: 'created_at', order: 'desc' } });
      if (data) {
        setVaultFiles(data.filter(f => !f.name.includes('.emptyFolderPlaceholder') && !f.name.startsWith('.')));
      }
    } catch (e) { console.error(e); }
    setVaultLoading(false);
  };

  useEffect(() => {
    if (showVault) loadVaultFiles('verdicts');
  }, [showVault]);

  const toggleVaultFileSelection = (filename: string) => {
    setSelectedVaultFiles(prev => prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleVaultDownload = async () => {
    if (selectedVaultFiles.length === 0) return alert("Select files to download first.");
    for (const filename of selectedVaultFiles) {
      const filePath = vaultBucket === 'grand_results' ? `today/${filename}` : filename;
      const { data } = await supabase.storage.from(vaultBucket).download(filePath);
      if (data) {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      await delay(300); 
    }
    setSelectedVaultFiles([]);
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const maxRankVotes = teamRankings.length > 0 ? teamRankings[0].votes : 1;

  // Ferris Wheel Smooth Spinning Loader Component
  const SpinningLoader = () => {
    const images = Array.from({ length: 12 }, (_, i) => `${i + 1}.jpg`); 
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
        
        {/* Parent container rotates 360 over 30s */}
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          className="relative w-64 h-64"
        >
          {images.map((img, i) => {
            const angle = (i / images.length) * 2 * Math.PI;
            // Radius of 120px from center
            const x = Math.cos(angle) * 120;
            const y = Math.sin(angle) * 120;
            
            return (
              <motion.div 
                key={i} 
                animate={{ rotate: -360 }} // Counter rotate so child stays upright
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                className="absolute w-14 h-14 rounded-xl border-2 border-pink-500 overflow-hidden shadow-[0_0_15px_rgba(244,114,182,0.5)] bg-slate-800 flex items-center justify-center"
                style={{
                  top: `calc(50% + ${y}px - 28px)`,
                  left: `calc(50% + ${x}px - 28px)`,
                }}
              >
                <img src={`/5TH/${img}`} alt="loading" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </motion.div>
            )
          })}
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="w-12 h-12 text-pink-400 animate-pulse" />
          </div>
        </motion.div>

        {isVotingActive ? (
           <p className="mt-16 font-black uppercase tracking-widest text-pink-400 animate-pulse text-5xl font-mono drop-shadow-lg">{formatTime(votingTimeLeft)}</p>
        ) : (
           <p className="mt-16 font-black uppercase tracking-widest text-pink-400 animate-pulse">Syncing Leaderboard...</p>
        )}
      </motion.div>
    );
  };

  const CelebrationBalloons = () => {
    const colors = ['from-pink-500 to-rose-600', 'from-yellow-400 to-orange-500', 'from-indigo-500 to-purple-600', 'from-emerald-400 to-teal-500', 'from-cyan-400 to-blue-600'];
    const confettiColors = ['bg-pink-500', 'bg-yellow-400', 'bg-indigo-500', 'bg-emerald-400', 'bg-white'];
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[600]">
        {/* Confetti */}
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={`confetti-${i}`}
            initial={{ y: '-10vh', x: Math.random() * window.innerWidth, rotate: Math.random() * 360, opacity: 1 }}
            animate={{ y: '110vh', rotate: Math.random() * 720, x: `+=${Math.random() * 100 - 50}`, opacity: 0 }}
            transition={{ duration: Math.random() * 3 + 2, ease: 'linear', repeat: Infinity, delay: Math.random() * 2 }}
            className={`absolute w-2 h-4 ${confettiColors[i % confettiColors.length]} rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
          />
        ))}
        {/* Balloons */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`balloon-${i}`}
            initial={{ y: '120vh', x: Math.random() * (window.innerWidth - 100), scale: Math.random() * 0.6 + 0.6, opacity: 1, rotate: Math.random() * 40 - 20 }}
            animate={{ y: '-20vh', x: `+=${Math.random() * 100 - 50}`, opacity: 0 }}
            transition={{ duration: Math.random() * 4 + 4, ease: 'easeOut', delay: Math.random() * 1.5 }}
            className={`absolute w-16 h-20 bg-gradient-to-tr ${colors[i % colors.length]} shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.4),inset_5px_5px_15px_rgba(255,255,255,0.4),0_10px_20px_rgba(0,0,0,0.5)]`}
            style={{ borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' }}
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-inherit" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <div className="absolute -bottom-16 left-1/2 w-[1px] h-16 bg-white/30" />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-[#0B0E14] flex flex-col overflow-hidden font-sans">
        
        {/* UFO Easter Egg for 'Jun' */}
        <AnimatePresence>
          {showUFO && (
            <motion.div 
              initial={{ x: '100vw', y: '80vh', scale: 0.5 }}
              animate={{ x: '-20vw', y: '10vh', scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 12, ease: "linear" }}
              className="absolute z-[700] pointer-events-none flex flex-col items-center"
            >
              <Rocket className="w-16 h-16 text-emerald-400 animate-pulse drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] transform -rotate-45" />
              <div className="bg-emerald-950/80 border border-emerald-500/50 px-4 py-2 rounded-full mt-2 shadow-[0_0_20px_rgba(52,211,153,0.4)] whitespace-nowrap">
                <span className="text-emerald-300 font-black text-[10px] tracking-widest uppercase">Thank you Sir Jun for having you in this live broadcast!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .clip-path-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
          .clip-path-shield { clip-path: polygon(50% 0%, 100% 0, 100% 80%, 50% 100%, 0 80%, 0 0); }
          .clip-path-heavy-shield { clip-path: polygon(10% 0, 90% 0, 100% 20%, 50% 100%, 0 20%); }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>

        {isVotingActive && <SpinningLoader />}

        {/* HEADER */}
        <div className="h-16 border-b border-white/5 px-4 md:px-6 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-20 shrink-0">
          <button onClick={onClose} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Exit Arena
          </button>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setShowVaultAuth(true)} className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Archive className="w-4 h-4" /> Vault
            </button>
            <button onClick={() => setShowGuide(true)} className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Info className="w-4 h-4" /> Guide
            </button>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-pink-400 hover:text-pink-300 transition-colors">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-full">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <h1 className="text-[10px] md:text-xs font-black text-rose-400 uppercase tracking-widest">Live Broadcast</h1>
            </div>
          </div>
        </div>

        {/* VAULT AUTH MODAL */}
        <AnimatePresence>
          {showVaultAuth && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[#121620] border border-cyan-500/30 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(34,211,238,0.2)] w-full max-w-sm relative text-center"
              >
                <button onClick={() => setShowVaultAuth(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                <Lock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Vault Access</h2>
                <p className="text-xs text-slate-400 mb-6">Enter passphrase to access database files.</p>
                <form onSubmit={handleVaultAuthSubmit}>
                  <input 
                    type="password" required value={vaultPass} onChange={e => setVaultPass(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-black/50 border border-white/10 text-white text-center rounded-xl px-4 py-3 text-2xl font-bold mb-6 outline-none focus:border-cyan-500 tracking-widest"
                  />
                  <button type="submit" className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-black rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    <Key className="w-4 h-4" /> Unlock Vault
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VAULT DATA MODAL */}
        <AnimatePresence>
          {showVault && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[700] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-[#121620] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none" />

                <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/10 relative z-10 shrink-0">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-cyan-400 uppercase tracking-widest flex items-center gap-3">
                      <Archive className="w-6 h-6" /> Storage Vault
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Manage generated PDF exports</p>
                  </div>
                  <button onClick={() => setShowVault(false)} className="text-slate-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-4 md:p-8 flex flex-col h-full relative z-10">
                  <div className="flex bg-black/40 border border-white/10 rounded-full p-1 mb-6 max-w-sm">
                    <button onClick={() => loadVaultFiles('verdicts')} className={`flex-1 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${vaultBucket === 'verdicts' ? 'bg-cyan-600 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}>
                      Team Verdicts
                    </button>
                    <button onClick={() => loadVaultFiles('grand_results')} className={`flex-1 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${vaultBucket === 'grand_results' ? 'bg-cyan-600 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}>
                      Grand Results
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide border border-white/5 rounded-2xl bg-black/20">
                    {vaultLoading ? (
                      <div className="flex flex-col items-center justify-center h-full text-cyan-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Fetching DB Records...</span>
                      </div>
                    ) : vaultFiles.length > 0 ? (
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-white/5 text-xs uppercase font-bold text-slate-400 sticky top-0 backdrop-blur-md">
                          <tr>
                            <th className="p-4 w-12 text-center">
                              <CheckSquare className="w-4 h-4 text-slate-500 mx-auto" />
                            </th>
                            <th className="p-4">Filename</th>
                            <th className="p-4 hidden md:table-cell">Size</th>
                            <th className="p-4">Date Modified</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vaultFiles.map((file, i) => (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleVaultFileSelection(file.name)}>
                              <td className="p-4 text-center">
                                <input type="checkbox" checked={selectedVaultFiles.includes(file.name)} readOnly className="accent-cyan-500 w-4 h-4 cursor-pointer" />
                              </td>
                              <td className="p-4 font-medium text-white flex items-center gap-3">
                                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span className="truncate max-w-[200px] md:max-w-[400px] block">{file.name}</span>
                              </td>
                              <td className="p-4 hidden md:table-cell text-slate-400 font-mono text-xs">{formatBytes(file.metadata?.size || 0)}</td>
                              <td className="p-4 text-slate-400 font-mono text-xs">{new Date(file.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <Archive className="w-12 h-12 text-slate-500 mb-4" />
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Bucket is empty.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center shrink-0 relative z-10 bg-[#121620]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedVaultFiles.length} files selected</p>
                  <button 
                    onClick={handleVaultDownload} disabled={selectedVaultFiles.length === 0}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 font-black rounded-xl uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Selected
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GUIDE MODAL */}
        <AnimatePresence>
          {showGuide && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[#121620] border border-white/10 p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl relative"
              >
                <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/30">
                    <HelpCircle className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest">Arena Guide</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-black shrink-0">1</span>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-widest mb-1 text-sm">Verdict Auto-Sync</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">The system automatically fetches officially exported PDF Defense Reports created today from the secure Supabase bucket.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">2</span>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-widest mb-1 text-sm">AI Agent Pre-Voting</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Gemma processes the matrix. The 5 Panelists and The Judge cast their randomized pre-votes to kickstart today's leaderboard.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">3</span>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-widest mb-1 text-sm">Live Audience Polling</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">The leaderboard goes live! Audience members use the 'Cast Live Vote' button to allocate badges. Votes sync to Supabase in real-time.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-black shrink-0">4</span>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-widest mb-1 text-sm">Grand Announcement</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Click 'Announce Winners' to trigger the 3D celebration, crown the Grand Champion, and export the official PDF summary.</p>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => setShowGuide(false)} className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest transition-colors">
                  Understood
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TIMER SETUP MODAL */}
        <AnimatePresence>
          {showTimerSetup && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[#121620] border border-white/10 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm relative text-center"
              >
                <button onClick={() => setShowTimerSetup(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                <Clock className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Voting Timer</h2>
                <p className="text-xs text-slate-400 mb-6">Set duration for live audience polling.</p>
                <input 
                   type="number" min="1" max="60" value={votingMinutes} onChange={e => setVotingMinutes(Number(e.target.value))}
                   className="w-full bg-black/50 border border-white/10 text-white text-center rounded-xl px-4 py-3 text-2xl font-bold mb-6 outline-none focus:border-pink-500"
                />
                <button onClick={startVotingTimer} className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-xl uppercase tracking-widest transition-colors">
                  Start Countdown
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STAGE 1: PROCESSING BUCKET */}
        {stage === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full blur-xl bg-pink-500/20 animate-pulse" />
              <Loader2 className="w-20 h-20 text-pink-500 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Gemma is Analyzing Data...</h2>
            <p className="text-pink-300/80 font-mono text-sm max-w-md mx-auto mb-8">
              Auto-syncing today's verdicts from Supabase bucket & injecting AI Panel preliminary votes.
            </p>
            <div className="flex gap-4 animate-pulse opacity-50 bg-black/40 p-4 rounded-2xl border border-white/5">
              <Terminal className="w-6 h-6 text-cyan-500"/>
              <Briefcase className="w-6 h-6 text-amber-500"/>
              <HelpCircle className="w-6 h-6 text-emerald-500"/>
              <BarChart3 className="w-6 h-6 text-purple-500"/>
              <ShieldCheck className="w-6 h-6 text-rose-500"/>
              <Gavel className="w-6 h-6 text-yellow-500"/>
            </div>
          </div>
        )}

        {/* STAGE 3: LIVE LEADERBOARD */}
        {stage === 'results' && (
          <div className="flex-1 overflow-y-auto relative p-4 md:p-8 scrollbar-hide flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-pink-600/5 blur-[120px] pointer-events-none rounded-full" />
            
            <div className="w-full max-w-[1600px] mx-auto flex flex-col relative z-10 pb-32">
              
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 font-mono flex items-center gap-3">
                    Achievement <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Badges</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-pink-500" /> {currentDate}
                    </p>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[9px] font-bold uppercase tracking-widest">Filtered: Today Only</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
                  <button onClick={() => speak("The leaderboard is live! Audience, cast your votes now to decide the ultimate winners.")} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-slate-600">
                    <Volume2 className="w-3 h-3" /> Gemma Intro
                  </button>
                  <button onClick={() => setShowTimerSetup(true)} className="px-4 py-2 bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-slate-600 hover:border-pink-500">
                    <Clock className="w-3 h-3" /> Set Timer
                  </button>
                  <button 
                    onClick={handleGrandAnnounce} 
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(244,114,182,0.5)] hover:scale-105"
                  >
                    <PartyPopper className="w-4 h-4" /> Announce Winners!
                  </button>
                </div>
              </div>

              {/* TWO COLUMN LAYOUT */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                
                {/* LEFT: BADGES GRID */}
                <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {BADGES.map((b, i) => {
                    const winner = results.find(r => r.badge === b.name);
                    return (
                      <motion.div 
                        key={b.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-[#121620] border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-white/10 transition-all shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                      >
                        <div className={`absolute -top-10 -right-10 w-32 h-32 ${b.color.replace('text-', 'bg-')}/10 blur-[40px] pointer-events-none`} />

                        <div className="w-28 h-28 flex items-center justify-center mb-6 relative">
                          <div className={`absolute inset-2 border ${b.outerShape} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                            <div className={`w-14 h-14 border-2 ${b.innerShape} flex items-center justify-center relative ${b.outerShape.includes('rotate-45') ? '-rotate-45' : ''}`}>
                              <b.icon className={`w-6 h-6 ${b.color} drop-shadow-md`} />
                            </div>
                          </div>
                        </div>
                        
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-2 text-white`}>{b.name}</h3>
                        <p className="text-[10px] text-slate-400 font-medium mb-4 px-1 leading-relaxed min-h-[3rem]">{b.desc}</p>
                        
                        <div className={`px-3 py-1 rounded-full border mb-6 text-[9px] font-black uppercase tracking-widest ${
                          b.rarity === 'Legendary' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                          b.rarity === 'Mythic' ? 'border-pink-500/50 text-pink-400 bg-pink-500/10' :
                          b.rarity === 'Epic' ? 'border-teal-500/50 text-teal-400 bg-teal-500/10' :
                          'border-purple-500/50 text-purple-400 bg-purple-500/10'
                        }`}>
                          {b.rarity}
                        </div>
                        
                        <div className="mt-auto w-full pt-4 border-t border-white/5 min-h-[70px] flex flex-col justify-end">
                          {winner ? (
                            <div className="flex flex-col items-center">
                              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-1">Current Leader</span>
                              <span className="text-white font-black uppercase text-xs mb-1 truncate w-full px-2">{winner.team}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${b.color}`}>{winner.votes} Votes</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center opacity-40">
                              <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Awaiting Votes</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* RIGHT: LIVE RANKING & FEED */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Total Rankings */}
                  <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] pointer-events-none" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                      <Trophy className="w-4 h-4 text-indigo-400" /> Overall Rankings
                    </h3>
                    <div className="space-y-4">
                      {teamRankings.length > 0 ? teamRankings.map((tr, idx) => {
                        const widthPercent = (tr.votes / maxRankVotes) * 100;
                        return (
                          <div key={idx} className="flex items-center justify-between relative py-2">
                            <div 
                              className={`absolute left-0 top-0 h-full rounded-r-lg -z-10 transition-all duration-1000 ease-out ${idx === 0 ? 'bg-indigo-500/20' : 'bg-white/5'}`}
                              style={{ width: `${widthPercent}%` }}
                            />
                            <div className="flex items-center gap-3 truncate pr-4 relative z-10 pl-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' : idx === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-white/5 text-slate-500'}`}>
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-200 truncate">{tr.team}</span>
                            </div>
                            <span className="text-xs font-black text-indigo-400 shrink-0 pr-2 relative z-10">{tr.votes}</span>
                          </div>
                        );
                      }) : (
                        <div className="flex flex-col items-center py-6 opacity-40">
                          <Trophy className="w-8 h-8 text-slate-500 mb-2" />
                          <p className="text-xs text-slate-500 italic">No votes cast today.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Feed */}
                  <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden h-96 flex flex-col">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/10 blur-[40px] pointer-events-none" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-4 shrink-0">
                      <Activity className="w-4 h-4 text-pink-400" /> Live Feed
                    </h3>
                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2">
                      <AnimatePresence>
                        {recentFeed.length > 0 ? recentFeed.map((feed, idx) => (
                          <motion.div 
                            key={feed.created_at + idx}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="bg-black/40 border border-white/5 rounded-xl p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1">
                                {feed.voter_alias} {AI_AGENTS.includes(feed.voter_alias) && <BotIcon />}
                              </span>
                              <span className="text-[9px] text-slate-500 font-medium">{timeAgo(feed.created_at)}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Voted <strong className="text-white">{feed.team_name}</strong> for <span className="text-indigo-300">{feed.badge_name}</span>.
                            </p>
                          </motion.div>
                        )) : (
                          <div className="flex flex-col items-center py-10 opacity-40 h-full justify-center">
                            <Activity className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-xs text-slate-500 italic">Network feed empty.</p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* AUDIENCE VOTING ELEGANT BUTTON */}
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
              >
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
                  <button 
                    onClick={() => setShowVoteModal(true)}
                    className="relative px-8 py-5 bg-black/80 backdrop-blur-xl border border-white/20 hover:border-pink-500/50 text-white font-black rounded-full uppercase tracking-widest shadow-2xl text-sm md:text-base flex items-center gap-4 transition-all hover:scale-105"
                  >
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-pink-400 group-hover:text-pink-300 transition-colors" /> 
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 group-hover:from-pink-100 group-hover:to-white transition-all">
                      Audience: Cast Live Vote
                    </span>
                    <ChevronLeft className="w-5 h-5 rotate-180 text-pink-500" />
                  </button>
                </div>
              </motion.div>
              
            </div>
          </div>
        )}

        {/* CELEBRATION GRAND RESULTS MODAL */}
        <AnimatePresence>
          {showGrandResults && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[500] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
            >
              {/* 3D Animated Balloons */}
              <CelebrationBalloons />

              <motion.div 
                initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="bg-[#121620]/90 border border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(244,114,182,0.3)] w-full max-w-5xl h-[85vh] flex flex-col relative overflow-hidden z-10 backdrop-blur-2xl"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 blur-[100px] pointer-events-none" />

                <div className="flex justify-between items-start p-6 md:p-10 border-b border-white/10 relative z-10 shrink-0">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-pink-500 uppercase tracking-tighter drop-shadow-lg">Official Grand Results</h2>
                    <p className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" /> {currentDate}
                    </p>
                  </div>
                  <button onClick={() => setShowGrandResults(false)} className="text-slate-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors z-50">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide relative z-10">
                  
                  {/* GRAND CHAMPION REVEAL */}
                  {teamRankings.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}
                      className="mb-12 flex flex-col items-center text-center"
                    >
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-yellow-500/30 blur-3xl rounded-full animate-pulse" />
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-b from-yellow-300 to-amber-600 rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-[0_0_50px_rgba(251,191,36,0.6)] relative z-10">
                          <Crown className="w-16 h-16 md:w-20 md:h-20 text-yellow-950" />
                        </div>
                      </div>
                      <h3 className="text-sm font-black text-yellow-500 uppercase tracking-[0.3em] mb-2">Overall Grand Champion</h3>
                      <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                        {teamRankings[0].team}
                      </h1>
                      <p className="text-yellow-200/80 font-bold uppercase tracking-widest mt-3 bg-yellow-900/30 px-4 py-1 rounded-full border border-yellow-500/30">
                        {teamRankings[0].votes} Total Audience & AI Points
                      </p>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                    
                    {/* Final Badges Section */}
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                        <Award className="w-6 h-6 text-pink-400" /> Crowned Badges
                      </h3>
                      <div className="space-y-4">
                        {BADGES.map((b, i) => {
                          const winner = results.find(r => r.badge === b.name);
                          return (
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 + (i * 0.1) }} key={b.name} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                              <div className="flex items-center gap-3">
                                <b.icon className={`w-6 h-6 ${b.color}`} />
                                <div>
                                  <p className="text-xs md:text-sm font-black text-white uppercase tracking-widest">{b.name}</p>
                                </div>
                              </div>
                              {winner ? (
                                <div className="text-right">
                                  <p className="text-sm font-black text-emerald-400 uppercase">{winner.team}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{winner.votes} Votes</p>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-600 font-bold uppercase">Unawarded</span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Overall Leaderboard Section */}
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-amber-400" /> Final Leaderboard
                      </h3>
                      <div className="space-y-4">
                        {teamRankings.map((tr, idx) => {
                          const widthPercent = (tr.votes / maxRankVotes) * 100;
                          return (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 + (idx * 0.1) }} key={idx} className={`relative p-5 rounded-2xl border flex items-center justify-between overflow-hidden ${idx === 0 ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-white/10'}`}>
                              <div 
                                className={`absolute left-0 top-0 h-full rounded-r-lg -z-10 transition-all duration-1000 ease-out ${idx === 0 ? 'bg-amber-500/20' : 'bg-white/5'}`}
                                style={{ width: `${widthPercent}%` }}
                              />
                              <div className="flex items-center gap-4 relative z-10 pl-2">
                                <span className={`text-2xl md:text-3xl font-black ${idx === 0 ? 'text-amber-400 drop-shadow-md' : 'text-slate-500'}`}>#{idx + 1}</span>
                                <p className={`text-sm md:text-base font-black uppercase tracking-wider ${idx === 0 ? 'text-white' : 'text-slate-300'}`}>{tr.team}</p>
                              </div>
                              <span className={`text-sm font-black relative z-10 pr-2 ${idx === 0 ? 'text-amber-400' : 'text-indigo-400'}`}>{tr.votes} Pts</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="p-6 md:p-8 border-t border-white/10 flex justify-center shrink-0 relative z-10 bg-[#121620]">
                  <button 
                    onClick={exportGrandResultsPDF}
                    className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 flex items-center gap-3"
                  >
                    <Download className="w-5 h-5" /> Export Official PDF Report
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voting Modal Overlay */}
        <AnimatePresence>
          {showVoteModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[#121620] border border-white/10 p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl relative flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto scrollbar-hide"
              >
                <button onClick={() => setShowVoteModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20"><X className="w-6 h-6"/></button>
                
                {/* Left Side: Form */}
                <div className="flex-1 w-full">
                  {voteSuccess ? (
                    <div className="flex flex-col items-center text-center py-10">
                      <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
                      <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Vote Cast!</h3>
                      <p className="text-slate-400 text-sm">Your vote has been securely recorded to the database.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center md:items-start mb-8 relative">
                        <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-4 border border-pink-500/30">
                          <Award className="w-8 h-8 text-pink-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest">Cast Your Vote</h3>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Select the team that deserves this badge.</p>
                      </div>
                      
                      <form onSubmit={submitAudienceVote} className="space-y-5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Alias <span className="text-pink-500">*</span></label>
                          <input 
                            type="text" required value={voteAlias} onChange={(e) => setVoteAlias(e.target.value)}
                            placeholder="e.g., Mentor Dan"
                            className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 mt-1 outline-none focus:border-pink-500 text-sm focus:ring-1 focus:ring-pink-500 transition-all"
                          />
                          <p className="text-[9px] text-slate-500 mt-1 italic">Will be saved locally for quick voting.</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Team <span className="text-pink-500">*</span></label>
                          {dbTeams.length > 0 ? (
                            <select required value={voteTeamId} onChange={(e) => setVoteTeamId(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 mt-1 outline-none focus:border-pink-500 text-sm appearance-none">
                              <option value="">-- Choose a Team --</option>
                              {dbTeams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                            </select>
                          ) : (
                            <div className="text-rose-400 text-xs font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mt-1">
                              No teams found in database.
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Badge <span className="text-pink-500">*</span></label>
                          <select required value={voteBadge} onChange={(e) => setVoteBadge(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 mt-1 outline-none focus:border-pink-500 text-sm appearance-none">
                            <option value="">-- Choose an Award --</option>
                            {BADGES.map(b => <option key={b.name} value={b.name}>{b.name} - {b.rarity}</option>)}
                          </select>
                        </div>
                        
                        <button disabled={isSubmittingVote || dbTeams.length === 0} type="submit" className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black uppercase tracking-widest rounded-xl mt-6 transition-all hover:shadow-[0_0_20px_rgba(244,114,182,0.4)] flex items-center justify-center gap-2">
                          {isSubmittingVote ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : "Submit Vote to Database"}
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Right Side: Voting Summary for Current User */}
                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 flex flex-col">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                    <UserCircle className="w-4 h-4 text-indigo-400" /> Your Votes Today
                  </h4>
                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
                    {userPastVotes.length > 0 ? userPastVotes.map((pv, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-between group cursor-pointer hover:border-pink-500/50 transition-colors" onClick={() => handleEditVote(pv.badge_name)}>
                        <div>
                          <p className="text-[10px] font-bold text-pink-400 uppercase truncate max-w-[120px]">{pv.badge_name}</p>
                          <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{dbTeams.find(t => t.id === pv.team_id)?.team_name || 'Unknown'}</p>
                        </div>
                        <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-pink-400 transition-colors" />
                      </div>
                    )) : (
                      <div className="flex flex-col items-center py-6 opacity-40">
                        <Award className="w-6 h-6 text-slate-500 mb-2" />
                        <p className="text-xs text-slate-500 italic text-center">You haven't voted today.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
};

// Mini Bot icon for Agent feed
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 ml-1">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);