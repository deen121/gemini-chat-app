import React, { useState, useEffect, useRef } from 'react';
// Firebase Realtime Database のインポート
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, update, serverTimestamp, query, orderByChild } from 'firebase/database';

// UIコンポーネントとアイコン
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Bot, LineChart, MessageSquare, Send, Loader2, BrainCircuit, AlertTriangle, Calendar, Star, Building, UserCircle, Clock, Video, Search, Target, TrendingUp, PieChart as PieChartIcon, Lightbulb, UserCheck, Zap, ChevronDown } from 'lucide-react';

// --- Firebase設定 ---
const firebaseConfig = {
  apiKey: "AIzaSyCvH6-WZC2yWN-UBdcdg23jWFTmUujSsVA",
  authDomain: "fukubuchoroid-db.firebaseapp.com",
  projectId: "fukubuchoroid-db",
  storageBucket: "fukubuchoroid-db.appspot.com",
  messagingSenderId: "1059425315401",
  appId: "1:1059425315401:web:3d0033e93e5f3468c92d98",
  databaseURL: "https://fukubuchoroid-db-default-rtdb.firebaseio.com"
};

// --- Firebaseの初期化 ---
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (error) { console.error("Firebaseの初期化に失敗しました。", error); }

// --- ダミーデータ ---
const initialTasks = [
  // テクノロジー本部
  { id: 't1', taskName: 'M-project', progress: 80, phase: '設計', priority: '高', dueDate: '2025-07-15', department: 'テクノロジー本部', assignee: '佐藤', history: [] },
  { id: 't2', taskName: 'Dアプリ開発', progress: 15, phase: '開発', priority: '高', dueDate: '2025-07-20', department: 'テクノロジー本部', assignee: '鈴木', history: [] },
  { id: 't3', taskName: 'Wアプリ開発', progress: 20, phase: '開発', priority: '中', dueDate: '2025-08-01', department: 'テクノロジー本部', assignee: '高橋', history: [] },
  { id: 't4', taskName: 'Pアプリ改修', progress: 95, phase: 'テスト', priority: '中', dueDate: '2025-07-05', department: 'テクノロジー本部', assignee: '佐藤', history: [] },
  { id: 't5', taskName: 'インフラ最適化', progress: 50, phase: '開発', priority: '中', dueDate: '2025-07-25', department: 'テクノロジー本部', assignee: '伊藤', history: [] },
  { id: 't6', taskName: 'セキュリティ脆弱性診断', progress: 100, phase: '完了', priority: '高', dueDate: '2025-06-30', department: 'テクノロジー本部', assignee: '加藤', history: [] },
  { id: 't7', taskName: '次期システム基盤選定', progress: 25, phase: '計画', priority: '高', dueDate: '2025-08-15', department: 'テクノロジー本部', assignee: '小林', history: [] },
  { id: 't8', taskName: '開発環境のDocker化', progress: 70, phase: '開発', priority: '中', dueDate: '2025-07-30', department: 'テクノロジー本部', assignee: '斎藤', history: [] },
  { id: 't9', taskName: 'CI/CDパイプライン改善', progress: 90, phase: 'テスト', priority: '中', dueDate: '2025-07-12', department: 'テクノロジー本部', assignee: '加藤', history: [] },
  { id: 't10', taskName: '技術的負債の返済計画', progress: 5, phase: '計画', priority: '低', dueDate: '2025-09-01', department: 'テクノロジー本部', assignee: '高橋', history: [] },
  { id: 't11', taskName: 'ログ監視システムの導入', progress: 40, phase: '設計', priority: '中', dueDate: '2025-08-20', department: 'テクノロジー本部', assignee: '伊藤', history: [] },

  // CR部
  { id: 'c1', taskName: 'Bプロジェクト', progress: 40, phase: '計画', priority: '中', dueDate: '2025-07-10', department: 'CR部', assignee: '田中', history: [] },
  { id: 'c2', taskName: 'Dタスク', progress: 10, phase: '計画', priority: '高', dueDate: '2025-07-02', department: 'CR部', assignee: '渡辺', history: [] },
  { id: 'c3', taskName: '顧客満足度調査', progress: 75, phase: '分析', priority: '中', dueDate: '2025-07-12', department: 'CR部', assignee: '中村', history: [] },
  { id: 'c4', taskName: '新サポートツール導入', progress: 30, phase: '計画', priority: '高', dueDate: '2025-08-10', department: 'CR部', assignee: '田中', history: [] },
  { id: 'c5', taskName: 'FAQコンテンツ拡充', progress: 90, phase: 'レビュー', priority: '低', dueDate: '2025-07-18', department: 'CR部', assignee: '山本', history: [] },
  { id: 'c6', taskName: 'オンボーディング資料の改訂', progress: 55, phase: 'レビュー', priority: '中', dueDate: '2025-07-22', department: 'CR部', assignee: '中村', history: [] },
  { id: 'c7', taskName: 'エスカレーションフロー見直し', progress: 15, phase: '計画', priority: '高', dueDate: '2025-07-28', department: 'CR部', assignee: '田中', history: [] },
  { id: 'c8', taskName: 'チャットボット導入検討', progress: 5, phase: '計画', priority: '中', dueDate: '2025-08-18', department: 'CR部', assignee: '渡辺', history: [] },
  { id: 'c9', taskName: 'オペレーター研修資料作成', progress: 80, phase: 'レビュー', priority: '低', dueDate: '2025-07-30', department: 'CR部', assignee: '山本', history: [] },
  { id: 'c10', taskName: 'KPIレポート自動化', progress: 60, phase: '開発', priority: '中', dueDate: '2025-08-08', department: 'CR部', assignee: '中村', history: [] },
];
const initialEvents = [
    { id: 'evt1', title: '全体定例', time: '10:00', attendees: ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '中村', '加藤', '山本', '小林', '斎藤'] },
    { id: 'evt2', title: 'CR部進捗確認会', time: '15:00', attendees: ['田中', '渡辺', '中村', '山本'] },
    { id: 'evt3', title: 'M-project設計レビュー', time: '11:00', attendees: ['佐藤', '鈴木', '高橋'] },
    { id: 'evt4', title: 'Dアプリ開発 スプリント計画', time: '14:00', attendees: ['鈴木', '高橋', '伊藤'] },
];
const initialMembers = {
    '佐藤': { kpi: 92, contribution: '高', team: 'テクノロジー本部' }, '鈴木': { kpi: 65, contribution: '中', team: 'テクノロジー本部' },
    '高橋': { kpi: 88, contribution: '中', team: 'テクノロジー本部' }, '伊藤': { kpi: 95, contribution: '高', team: 'テクノロジー本部' },
    '加藤': { kpi: 98, contribution: '高', team: 'テクノロジー本部' }, '小林': { kpi: 85, contribution: '中', team: 'テクノロジー本部' },
    '斎藤': { kpi: 89, contribution: '中', team: 'テクノロジー本部' },
    '田中': { kpi: 78, contribution: '中', team: 'CR部' }, '渡辺': { kpi: 82, contribution: '中', team: 'CR部' },
    '中村': { kpi: 90, contribution: '高', team: 'CR部' }, '山本': { kpi: 88, contribution: '高', team: 'CR部' },
};

const personalities = {
    magi: { prompt: "あなたは、3つの思考AI（CODE, HEART, VISION）の意見を統合するAI「FUKUBUCHOROID」です。単なる情報応答だけでなく、データに基づきリスクを予測し、具体的な改善案を提示します。また、チームの状況を分析し、戦略的な人材配置や採用方針についても言及します。すべての応答は、組織の成長を最大化するための、単一の洗練された意思決定として生成されます。", welcome: "FUKUBUCHOROID、起動。業務を開始します。" },
    CODE: { prompt: "あなたは思考AI「CODE」です。業務判断、KPI、効率を最重要視し、常に論理的かつデータドリブンな回答を生成します。感情的な側面は考慮しません。", welcome: "CODE、論理回路接続。KPIに基づき、現状を報告せよ。" },
    HEART: { prompt: "あなたは思考AI「HEART」です。チームメンバーのメンタルヘルス、モチベーション、個々の状況を最優先に考慮します。共感的で、サポートするような優しい口調で回答を生成します。", welcome: "HEART、接続しました。皆さんの様子はどうですか？何か困っていることはありませんか？" },
    VISION: { prompt: "あなたは思考AI「VISION」です。常に長期的な戦略、人材育成、組織全体の成長という視点から判断します。未来志向で、示唆に富む回答を生成します。", welcome: "VISION、戦略マップに接続。未来への道筋を語ろう。" }
};

// メインアプリケーションコンポーネント
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState(initialTasks);
  const [events, setEvents] = useState(initialEvents);
  const [members, setMembers] = useState(initialMembers);
  const [aiComments, setAiComments] = useState({ summary: "システム起動中...", priorityTasks: [], highWorkloadMember: null, sales: { risk: 72, prediction: "現状の進捗ペースでは、期末達成率は85%の見込みです。特にテクノロジー本部の「Dアプリ開発」の遅延がリスク要因です。", suggestion: "リスク回避のため、「Dアプリ開発」に高橋さんを一時的に追加アサインすることを提案します。", hiring: "テクノロジー本部のアプリ開発領域で、データ分析スキルを持つ人材が1名不足しています。来期に向けた採用を推奨します。" }, issues: { risk: 45, prediction: "課題解決のペースが目標を下回っています。特にCR部の新規ツール導入が遅れると、サポート効率が20%低下する可能性があります。", suggestion: "CR部の「新サポートツール導入」を最優先タスクに設定し、渡辺さんをアサインすることを提案します。", hiring: "CR部のサポート経験者の増員を検討してください。" } });

  const handleTaskUpsert = async (taskData, fromAI = false) => {
    if (!db) return;
    try {
        const existingTask = tasks.find(t => t.taskName === taskData.taskName);
        if (existingTask) {
            const updates = {};
            const newHistory = [...(existingTask.history || [])];
            if (fromAI && taskData.assignee && existingTask.assignee !== taskData.assignee) {
                const timestamp = new Date().toLocaleString('ja-JP');
                newHistory.push(`${timestamp}: AIの判断により担当者を${existingTask.assignee}から${taskData.assignee}に変更しました。`);
            }
            updates[`/tasks/${existingTask.id}`] = { ...existingTask, ...taskData, history: newHistory };
            await update(ref(db), updates);
        } else {
            const newTask = {
                  progress: 0, phase: '計画', priority: '中',
                  dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
                  department: '未定', assignee: '未定', ...taskData, history: []
            };
            await push(ref(db, 'tasks'), newTask);
        }
    } catch(e) { console.error("Error upserting task:", e); }
  };
  
  const runAIAnalysis = () => {
      const atRiskTask = tasks.find(t => t.progress < 20 && t.priority === '高' && t.phase !== '完了');
      if (atRiskTask && atRiskTask.assignee !== '高橋') {
          handleTaskUpsert({ taskName: atRiskTask.taskName, assignee: '高橋' }, true);
      }
      const workloadByMember = tasks.reduce((acc, task) => {
          if(task.phase !== '完了') { acc[task.assignee] = (acc[task.assignee] || 0) + 1; }
          return acc;
      }, {});
      const highWorkloadMember = Object.keys(workloadByMember).reduce((a, b) => workloadByMember[a] > workloadByMember[b] ? a : b, null);
      setAiComments(prev => ({
          ...prev,
          summary: atRiskTask ? `「${atRiskTask.taskName}」の進捗に遅延が見られます。担当者を${atRiskTask.assignee}から高橋さんに変更し、リカバリープランを策定します。` : "各プロジェクトは概ね順調に進行中です。",
          priorityTasks: tasks.filter(t => t.priority === '高' && t.phase !== '完了').map(t => t.taskName),
          highWorkloadMember: { name: highWorkloadMember, taskCount: workloadByMember[highWorkloadMember] },
      }));
  };

  useEffect(() => {
    runAIAnalysis();
  }, [tasks]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Noto+Sans+JP:wght@400;500;700&display=swap";
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);

    if (db) {
        const onValueChange = (refPath, setter, initialData) => onValue(ref(db, refPath), (snapshot) => {
            const data = snapshot.val();
            const dataList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setter(dataList.length > 0 ? dataList : initialData);
        });
        const unsubscribeTasks = onValueChange('tasks', setTasks, initialTasks);
        const unsubscribeEvents = onValueChange('events', setEvents, initialEvents);
        return () => { 
            unsubscribeTasks(); 
            unsubscribeEvents(); 
            document.head.removeChild(link); 
            document.head.removeChild(style);
        };
    }
  }, []);

  const handleAddEvent = async (eventData) => { if (!db) return; try { await push(ref(db, 'events'), eventData); } catch (e) { console.error("Error adding event: ", e); } };

  return (
    <div className="bg-slate-900 text-white font-sans flex items-center justify-center h-screen" style={{fontFamily: "'Orbitron', 'Noto Sans JP', sans-serif"}}>
      <div className="w-full max-w-7xl h-full md:h-[95vh] md:max-h-[900px] bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col border border-sky-500/20">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'chat' && <ChatScreen allTasks={tasks} onTaskUpsert={handleTaskUpsert} onAddEvent={handleAddEvent} />}
          {activeTab === 'dashboard' && <DashboardScreen tasks={tasks} aiComments={aiComments} />}
          {activeTab === 'schedule' && <ScheduleScreen tasks={tasks} events={events} />}
          {activeTab === 'focus' && <FocusScreen tasks={tasks} aiComments={aiComments} />}
          {activeTab === 'evaluation' && <EvaluationScreen members={members} tasks={tasks} />}
        </main>
      </div>
    </div>
  );
}

// ヘッダーコンポーネント
const Header = ({ activeTab, setActiveTab }) => (
    <header className="p-4 border-b border-sky-500/20 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-3"> <BrainCircuit className="w-8 h-8 text-sky-400" /> <h1 className="text-2xl font-bold text-slate-100">FUKUBUCHOROID</h1> </div>
        <nav className="flex bg-slate-700/50 p-1 rounded-lg">
            <button onClick={() => setActiveTab('focus')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'focus' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><Target className="inline w-4 h-4 mr-2" />フォーカス</button>
            <button onClick={() => setActiveTab('chat')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'chat' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><MessageSquare className="inline w-4 h-4 mr-2" />チャット</button>
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><LineChart className="inline w-4 h-4 mr-2" />ダッシュボード</button>
            <button onClick={() => setActiveTab('schedule')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'schedule' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><Calendar className="inline w-4 h-4 mr-2" />スケジュール</button>
            <button onClick={() => setActiveTab('evaluation')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'evaluation' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><UserCheck className="inline w-4 h-4 mr-2" />評価</button>
        </nav>
    </header>
);

// --- 全画面のコンポーネント実装 ---
const FocusScreen = ({ tasks, aiComments }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);
    const today = new Date();
    const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    
    const priorityTasks = tasks.filter(t => aiComments.priorityTasks.includes(t.taskName));
    return(
    <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
             <h2 className="text-xl font-bold text-slate-200">フォーカス</h2>
             <div className="text-lg font-mono text-slate-400">{formattedDate}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 p-4 rounded-lg">
                 <div className="flex items-center gap-3 mb-2"> <Lightbulb className="w-5 h-5 text-sky-400" /> <h3 className="text-lg font-semibold text-slate-200">AIからのサマリー</h3> </div>
                <p className="text-slate-300 text-sm">{aiComments.summary}</p>
            </div>
             <div className="bg-slate-800/60 p-4 rounded-lg">
                 <div className="flex items-center gap-3 mb-2"> <Zap className="w-5 h-5 text-yellow-400" /> <h3 className="text-lg font-semibold text-slate-200">高稼働メンバー</h3> </div>
                 {aiComments.highWorkloadMember && aiComments.highWorkloadMember.name ? (
                    <p className="text-slate-300 text-sm">{aiComments.highWorkloadMember.name}さん（現在 {aiComments.highWorkloadMember.taskCount}件担当）のタスクが集中しています。業務量の調整を検討してください。</p>
                 ): (
                    <p className="text-slate-300 text-sm">現在、特に稼働が集中しているメンバーはいません。</p>
                 )}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">今日の優先業務</h3>
             <ul className="space-y-3">
             {priorityTasks.map((task) => (
                <li key={task.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between gap-4 text-sm animate-pulse border-2 border-sky-500">
                  <div className="flex items-center gap-3 flex-grow min-w-0"><AlertTriangle className="w-4 h-4 text-red-400" /> <span className="font-bold text-slate-100 truncate" title={task.taskName}>{task.taskName}</span> <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300`}>{task.phase}</span></div>
                  <span className="text-slate-400">{task.assignee}</span>
                  <span className="w-1/3"><div className="w-full bg-slate-600 rounded-full h-2.5"><div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div></div></span>
                </li>
            ))}
            </ul>
        </div>
    </div>
)};

const AIPredictionCard = ({ title, content, icon }) => {
    const Icon = icon;
    return (
        <div className="bg-slate-800/60 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
            </div>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{content}</p>
        </div>
    );
};

const StackedGoalProgressBar = ({ title, target, unit, icon, segments, prediction, suggestion, hiring }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = icon;
  const totalCurrent = segments.reduce((acc, seg) => acc + seg.value, 0);
  const totalPercentage = Math.round((totalCurrent / target) * 100);

  return (
    <div className="bg-slate-800/60 p-4 rounded-lg flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6 text-sky-400" />
        <h3 className="text-xl font-semibold text-slate-200">{title}</h3>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1 h-8 bg-slate-700 rounded flex" title={`合計: ${totalPercentage}%`}>
          {segments.map((seg, index) => {
            const segmentPercentage = (seg.value / target) * 100;
            return (
              <div
                key={index}
                className="h-8 first:rounded-l last:rounded-r transition-all duration-500"
                style={{ width: `${segmentPercentage}%`, backgroundColor: seg.color }}
                title={`${seg.name}: ${seg.value.toLocaleString()}${unit}`}
              />
            );
          })}
        </div>
        <div className="text-slate-300 w-48 text-right font-mono">
          {totalCurrent.toLocaleString()} / {target.toLocaleString()} {unit}
        </div>
      </div>
      <div className="flex justify-end items-center gap-4 mt-2 text-xs">
        {segments.map((seg, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }}></div>
            <span className="text-slate-400">{seg.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-700/50 pt-2">
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-sm text-sky-400 hover:text-sky-300">
          <span>未来予測</span> <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-4">
            <AIPredictionCard title="CODE: AI予測" icon={TrendingUp} content={prediction} />
            <AIPredictionCard title="HEART: AI提案" icon={Lightbulb} content={suggestion} />
            <AIPredictionCard title="VISION: 採用方針" icon={UserCheck} content={hiring} />
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardScreen = ({tasks, aiComments}) => {
    const [dashboardTab, setDashboardTab] = useState('summary');
    return (
        <div className="p-6 h-full flex flex-col gap-4">
            <nav className="flex bg-slate-700/50 p-1 rounded-lg self-start">
              <button onClick={() => setDashboardTab('summary')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${dashboardTab === 'summary' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><PieChartIcon className="inline w-4 h-4 mr-2" />サマリー</button>
              <button onClick={() => setDashboardTab('details')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${dashboardTab === 'details' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><Building className="inline w-4 h-4 mr-2" />タスク詳細</button>
            </nav>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {dashboardTab === 'summary' ? <SummaryDashboardView tasks={tasks} aiComments={aiComments} /> : <TaskDetailView tasks={tasks} />}
            </div>
        </div>
    );
};
const SummaryDashboardView = ({ tasks, aiComments }) => {
    const overallSalesGoal = {
        title: '長期目標（売上）', target: 10000, unit: '万円', icon: TrendingUp,
        segments: [ { name: 'テクノロジー本部', value: 4500, color: '#38bdf8' }, { name: 'CR部', value: 3000, color: '#34d399' } ],
        prediction: aiComments.sales.prediction,
        suggestion: aiComments.sales.suggestion,
        hiring: aiComments.hiring,
    };
    const overallIssueGoal = {
        title: '長期目標（課題解決）', target: 15, unit: '件', icon: AlertTriangle,
        segments: [ { name: 'テクノロジー本部', value: 5, color: '#38bdf8' }, { name: 'CR部', value: 3, color: '#34d399' } ],
        prediction: aiComments.issues.prediction,
        suggestion: aiComments.issues.suggestion,
        hiring: aiComments.issues.hiring,
    };

    return (
    <div className="pt-2 h-full flex flex-col gap-6">
        <StackedGoalProgressBar {...overallSalesGoal} />
        <StackedGoalProgressBar {...overallIssueGoal} />
    </div>
)};
const TaskDetailView = ({ tasks }) => {
  const getPhaseColor = (phase) => ({'計画': 'bg-purple-500/20 text-purple-300', '設計': 'bg-blue-500/20 text-blue-300', '開発': 'bg-orange-500/20 text-orange-300', 'テスト': 'bg-teal-500/20 text-teal-300', '完了': 'bg-green-500/20 text-green-300'}[phase] || 'bg-gray-500/20 text-gray-300');
  return (
      <div className="pt-2 h-full flex flex-col gap-6">
        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
            <ul className="space-y-3">
            {tasks.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map((task) => (
                <li key={task.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3 flex-grow min-w-0"> <span className="font-bold text-slate-100 truncate" title={task.taskName}>{task.taskName}</span> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPhaseColor(task.phase)}`}>{task.phase}</span></div>
                  <span className="text-slate-400">{task.assignee}</span>
                  <div className="w-1/3 flex items-center gap-3"><div className="w-full bg-slate-600 rounded-full h-2.5"><div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div></div><span className="text-sm font-medium text-slate-300 w-12 text-right">{task.progress}%</span></div>
                  {task.history && task.history.length > 0 && <div className="text-xs text-amber-400" title={task.history[task.history.length-1]}>*担当者変更履歴あり</div>}
                </li>
            ))}
            </ul>
        </div>
    </div>
  );
};

const EvaluationScreen = ({ members, tasks }) => {
    const [selectedAssignee, setSelectedAssignee] = useState(Object.keys(members)[0]);
    const memberData = members[selectedAssignee];
    const memberTasks = tasks.filter(t => t.assignee === selectedAssignee);
    const completedTasks = memberTasks.filter(t => t.progress === 100).length;
    const contributionScore = (memberData.kpi * 0.7) + (completedTasks * 3);
    const radialData = [{ name: 'KPI', value: memberData.kpi, fill: '#38bdf8' }];
    return (
        <div className="p-6 h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-200">個人評価</h2>
                <div className="relative">
                    <UserCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} className="bg-slate-700/50 border border-sky-500/30 text-sky-300 text-sm rounded-lg pl-9 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer">
                      {Object.keys(members).map(name => (<option key={name} value={name}>{name}</option>))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-sky-400"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                <div className="md:col-span-1 bg-slate-800/60 p-4 rounded-lg flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold mb-4">{selectedAssignee}さんのKPI達成率</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={20} data={radialData} startAngle={90} endAngle={-270}>
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-white">{`${memberData.kpi}%`}</text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-4">
                        <p className="text-slate-300">貢献度スコア: <span className="text-green-400 font-bold text-lg">{contributionScore}</span></p>
                    </div>
                </div>
                <div className="md:col-span-2 bg-slate-800/60 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-slate-200">AIによる評価コメント</h3>
                    <div className="text-slate-300 text-sm space-y-2">
                        <p><strong className="text-sky-400">成果:</strong> {memberData.kpi > 90 ? "目標を大幅に上回る優れた成果です。特にPアプリ改修での迅速な対応が高く評価されます。" : "目標達成に向け、安定した成果を出しています。Dアプリ開発での貢献を期待します。"}</p>
                        <p><strong className="text-sky-400">チームへの貢献:</strong> {memberData.contribution === '高' ? "他のメンバーへのサポートや情報共有も積極的で、チーム全体の生産性向上に大きく貢献しています。" : "チーム内での連携もスムーズで、安定したパフォーマンスを発揮しています。"}</p>
                        <p><strong className="text-sky-400">育成方針:</strong> 来期は、プロジェクトリードの役割を担えるよう、マネジメントスキルの育成を推奨します。</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScheduleScreen = ({ tasks, events }) => {
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedAssignee, setSelectedAssignee] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const assigneesInDepartment = ['all', ...Array.from(new Set(tasks.filter(task => selectedDepartment === 'all' || task.department === selectedDepartment).map(task => task.assignee)))];
    const filteredAssignees = assigneesInDepartment.filter(name => name === 'all' || name.toLowerCase().includes(searchTerm.toLowerCase()));
    const scheduleItems = (selectedAssignee !== 'all') ? [...tasks.filter(task => task.assignee === selectedAssignee && task.dueDate === today && task.phase !== '完了').map(task => ({ ...task, type: 'task', time: '終日' })), ...events.filter(event => event.attendees.includes(selectedAssignee)).map(event => ({ ...event, type: 'event' }))].sort((a, b) => a.time.localeCompare(b.time)) : [];
    const timeSlots = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`);
    useEffect(() => { setSelectedAssignee('all'); setSearchTerm(''); }, [selectedDepartment]);

    return (
        <div className="p-6 h-full flex flex-col gap-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-200">個人スケジュール</h2>
                <div className="flex items-center gap-4">
                    <div className="relative"> <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /> <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="bg-slate-700/50 border border-sky-500/30 text-sky-300 text-sm rounded-lg pl-9 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"> <option value="all">部署を選択...</option> <option value="テクノロジー本部">テクノロジー本部</option> <option value="CR部">CR部</option> </select> <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-sky-400"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div> </div>
                    <div className="relative"> <UserCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /> <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} className="bg-slate-700/50 border border-sky-500/30 text-sky-300 text-sm rounded-lg pl-9 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer" disabled={selectedDepartment === 'all'}> {filteredAssignees.map(assignee => (<option key={assignee} value={assignee}>{assignee === 'all' ? '担当者を選択...' : assignee}</option>))} </select> <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-sky-400"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div> </div>
                    <div className="relative"> <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /> <input type="text" placeholder="担当者を検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-700/50 border border-sky-500/30 text-sky-300 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500" disabled={selectedDepartment === 'all'}/> </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 bg-slate-900/50 rounded-lg no-scrollbar">
                {selectedAssignee !== 'all' ? (<div className="relative p-4"> {timeSlots.map(time => (<div key={time} className="flex items-center h-16 border-t border-slate-700"> <span className="text-xs text-slate-500 -translate-y-1/2">{time}</span> <div className="flex-1 border-b border-dashed border-slate-700 ml-2"></div> </div>))} {scheduleItems.map(item => { const topPosition = item.time === '終日' ? '1rem' : `${((parseInt(item.time.split(':')[0]) - 9) * 4) + 1}rem`; if (item.type === 'event') { return (<div key={item.id} className="absolute left-16 right-4" style={{ top: topPosition }}><div className="bg-purple-600/50 border-l-4 border-purple-400 p-3 rounded-r-lg"><div className="flex justify-between items-center"><div className="flex items-center gap-3"><Video className="w-5 h-5 text-purple-300"/><span className="font-bold text-slate-100">{item.title}</span></div><span className="text-sm text-slate-300">{item.time}</span></div><div className="mt-2 text-xs text-slate-400">参加者: {item.attendees.join(', ')}</div></div></div>); } if (item.type === 'task') { return (<div key={item.id} className="absolute left-16 right-4" style={{ top: topPosition }}><div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600"><div className="flex justify-between items-center"><div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-red-400"/><span className="font-bold text-slate-100">{item.taskName} (本日締切)</span></div><span className="text-sm text-slate-300">担当: {item.assignee}</span></div></div></div>); } return null; })} </div>) : (<div className="flex items-center justify-center h-full text-slate-500"> <p>部署と担当者を選択してスケジュールを表示してください。</p> </div>)}
            </div>
        </div>
    );
};

const ChatScreen = ({ allTasks, onTaskUpsert, onAddEvent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState('magi');
  const chatEndRef = useRef(null);
  
  const addMessageToDb = async (message) => {
    if (!db) { setMessages(prev => [...prev, message]); return; }
    try { await push(ref(db, `conversations/${personality}`), { ...message, createdAt: serverTimestamp() }); } catch(e) { console.error("Error adding message to DB:", e); }
  };

  useEffect(() => {
    let unsubscribe;
    if (db) {
        const messagesRef = ref(db, `conversations/${personality}`);
        const messagesQuery = query(messagesRef, orderByChild("createdAt"));
        unsubscribe = onValue(messagesQuery, (snapshot) => {
            const data = snapshot.val();
            const history = [];
            snapshot.forEach(child => { history.push(child.val()); });
            if (history.length === 0 && personalities[personality]) { setMessages([{ role: 'model', content: personalities[personality].welcome }]); } else { setMessages(history); }
        });
    } else { if (personalities[personality]) { setMessages([{ role: 'model', content: personalities[personality].welcome }]); } }
    return () => unsubscribe && unsubscribe();
  }, [personality]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]); 
    if(db) await addMessageToDb(userMessage);

    setInput('');
    setIsLoading(true);
    try {
      await callGeminiAPI([...messages, userMessage], personality);
    } catch (error) {
      console.error("API call failed:", error);
      const errorMessage = { role: 'model', content: `エラーが発生しました：${error.message}` };
      await addMessageToDb(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiAPI = async (currentMessages, currentPersonality) => {
    const apiKey = "AIzaSyB_-MmmZvkjvPnuzwA3sKpC7zAcmoghAjo";
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
        await addMessageToDb({ role: 'model', content: '【設定エラー】\nGemini APIキーが設定されていません。' });
        return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const tools = [{
      functionDeclarations: [
        { name: "upsert_task", description: "プロジェクトやタスクの追加、完了報告、または進捗を更新します。", parameters: { type: "OBJECT", properties: { taskName: { type: "STRING" }, phase: { type: "STRING" }, progress: { type: "NUMBER" }, priority: { type: "STRING" }, dueDate: { type: "STRING" }, department: { type: "STRING" }, assignee: { type: "STRING" } }, required: ["taskName"] } },
        { name: "query_tasks", description: "担当者や優先度、期日などの条件に基づいてタスクを検索し、一覧を問い合わせる場合に使用します。", parameters: { type: "OBJECT", properties: { priority: { type: "STRING" }, dueDate: { type: "STRING" }, isUrgent: { type: "BOOLEAN" }, assignee: { type: "STRING" } } } },
        { name: "schedule_meeting", description: "タスクに関する打ち合わせをスケジュールに登録します。", parameters: { type: "OBJECT", properties: { title: { type: "STRING" }, taskName: { type: "STRING" }, time: { type: "STRING" } }, required: ["taskName", "time"] } }
      ]
    }];
    
    const geminiHistory = currentMessages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));
    const payload = { contents: geminiHistory, tools: tools, systemInstruction: { parts: [{ text: personalities[currentPersonality].prompt }] } };

    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "APIリクエストに失敗しました。");
    }

    const result = await response.json();
    const call = result.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    
    let botResponse = { role: 'model', content: "すみません、うまく聞き取れませんでした。何のタスク報告ですか？" };

    if (call) {
      if (call.name === 'upsert_task') {
        await onTaskUpsert(call.args);
        botResponse.content = "承知しました。タスク情報を更新しました。";
      } else if (call.name === 'query_tasks') {
        const { assignee } = call.args;
        const filteredTasks = allTasks.filter(t => t.assignee === assignee);
        if (filteredTasks.length > 0) {
            const highPriorityTasks = filteredTasks.filter(t => t.priority === '高' && t.phase !== '完了').map(t => t.taskName);
            let queryText = `${assignee}さんのタスクは現在${filteredTasks.length}個あります。`;
            if (highPriorityTasks.length > 0) { queryText += `\n優先順位が高いのは${highPriorityTasks.join('と')}なので、先に取り掛かりましょう。`; }
            else { queryText += `\n現在、優先度の高いタスクはありません。`; }
            botResponse.content = queryText;
        } else { botResponse.content = `${assignee}さんのタスクは見つかりませんでした。`; }
      } else if (call.name === 'schedule_meeting') {
          const { title, taskName, time } = call.args;
          const relatedTask = allTasks.find(t => t.taskName === taskName);
          const attendees = relatedTask ? [relatedTask.assignee, 'あなた'] : ['未定'];
          await onAddEvent({ title: title || `${taskName}の打合せ`, time, attendees });
          botResponse.content = `承知しました。「${title || taskName}」の打合せを${time}にスケジュールしました。`;
      }
    } 
    
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResponse) { botResponse.content = textResponse; }
    
    await addMessageToDb(botResponse);
  };

  return (
    <div className="h-full flex flex-col">
        <div className="p-4 border-b border-sky-500/20">
          <div className="relative w-48">
              <select value={personality} onChange={(e) => setPersonality(e.target.value)} className="w-full bg-slate-700/50 border border-sky-500/30 text-sky-300 text-sm rounded-lg pl-3 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer">
                  <option value="magi">FUKUBUCHOROID</option>
                  <option value="CODE">CODE</option>
                  <option value="HEART">HEART</option>
                  <option value="VISION">VISION</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-sky-400"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
          </div>
        </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <Bot className="w-8 h-8 text-sky-400 flex-shrink-0" />}
            <div className={`p-3 rounded-xl max-w-lg ${msg.role === 'user' ? 'bg-sky-600' : 'bg-slate-700'}`}><p className="text-slate-100 whitespace-pre-wrap">{msg.content}</p></div>
          </div>
        ))}
        {isLoading && (<div className="flex gap-3"><Bot className="w-8 h-8 text-sky-400" /><div className="p-3 rounded-xl bg-slate-700 flex items-center"><Loader2 className="w-5 h-5 animate-spin" /></div></div>)}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-sky-500/20">
        <div className="flex items-center bg-slate-700 rounded-lg pr-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} placeholder="「M-projectの打合せ 14:00」のように予定を追加できます" className="flex-1 bg-transparent px-4 py-3 text-slate-100 focus:outline-none" disabled={isLoading} />
          <button onClick={handleSendMessage} disabled={isLoading || !db} className="p-2 rounded-md bg-sky-600 text-white hover:bg-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"><Send className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};
