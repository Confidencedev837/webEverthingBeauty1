import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Calendar, BarChart, Settings, LogOut, CheckCircle, XCircle, FileText, Search, ArrowRight, RefreshCw, AlertCircle, User } from 'lucide-react';
import { VerificationStatus, Agent } from '../types';
import { getAgents, updateAgentVerification } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'analytics'>('verification');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    const res = await getAgents();
    if (res.error) {
      setError(res.error);
    } else {
      setAgents(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleVerify = async (agentId: string) => {
    setProcessingId(agentId);
    const ok = await updateAgentVerification(agentId, 'verified');
    if (ok) {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, verificationStatus: VerificationStatus.VERIFIED } : a));
    }
    setProcessingId(null);
  };

  const handleReject = async (agentId: string) => {
    setProcessingId(agentId);
    const ok = await updateAgentVerification(agentId, 'rejected');
    if (ok) {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, verificationStatus: VerificationStatus.REJECTED } : a));
    }
    setProcessingId(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const pendingAgents = agents.filter(a => a.verificationStatus === VerificationStatus.PENDING);
  const verifiedAgents = agents.filter(a => a.verificationStatus === VerificationStatus.VERIFIED);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D0D0D] flex pt-20">
      {/* Admin Sidebar */}
      <aside className="w-80 bg-[#111] p-10 hidden lg:flex flex-col text-white">
        <div className="flex items-center space-x-3 mb-16">
          <div className="w-12 h-12 bg-rosePink rounded-2xl flex items-center justify-center shadow-lg shadow-rosePink/30">
            <span className="text-2xl font-serif font-bold italic">EB</span>
          </div>
          <span className="text-xl font-serif font-bold tracking-tight uppercase">Admin Panel</span>
        </div>
        
        <nav className="space-y-4 flex-grow">
          <button 
            onClick={() => setActiveTab('verification')} 
            className={`w-full flex items-center space-x-5 p-5 rounded-2xl font-bold transition-all ${activeTab === 'verification' ? 'bg-rosePink shadow-lg shadow-rosePink/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <ShieldCheck className="w-6 h-6" />
            <span className="text-sm">Verification ({pendingAgents.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full flex items-center space-x-5 p-5 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-rosePink shadow-lg shadow-rosePink/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-sm">All Specialists ({agents.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`w-full flex items-center space-x-5 p-5 rounded-2xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-rosePink shadow-lg shadow-rosePink/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart className="w-6 h-6" />
            <span className="text-sm">Platform Stats</span>
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-4 p-5 text-rosePink font-black uppercase tracking-widest text-[10px] mt-auto hover:bg-rosePink/10 rounded-2xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit Admin Panel</span>
        </button>
      </aside>

      {/* Admin Main */}
      <main className="flex-grow p-8 sm:p-20 overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-2">
              {activeTab === 'verification' ? 'Verification Center' : activeTab === 'users' ? 'Specialist Directory' : 'Platform Analytics'}
            </h1>
            <p className="text-[#6C757D] font-medium">
              {activeTab === 'verification' 
                ? `${pendingAgents.length} Specialists awaiting credential and profile verification.`
                : `Managing ${agents.length} registered specialists across the platform.`}
            </p>
          </div>
          <button
            onClick={loadAgents}
            className="p-4 bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-[#6C757D] hover:text-rosePink transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-500 rounded-2xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-10">
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-64 bg-white dark:bg-[#1A1A1A] rounded-[3rem] animate-pulse border border-[#E9ECEF] dark:border-[#2D2D2D]" />
                ))}
              </div>
            ) : pendingAgents.length > 0 ? (
              pendingAgents.map((agent, i) => (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#1A1A1A] rounded-[4rem] p-12 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    <div>
                      <div className="flex items-center space-x-6 mb-10">
                        {agent.image ? (
                          <img src={agent.image} className="w-24 h-24 rounded-[2rem] object-cover shadow-xl" alt="" />
                        ) : (
                          <div className="w-24 h-24 rounded-[2rem] bg-rosePink/10 text-rosePink flex items-center justify-center font-bold">
                            <User className="w-10 h-10" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-3xl font-serif font-bold mb-1">{agent.name}</h3>
                          <div className="text-rosePink font-black uppercase tracking-widest text-[10px]">{agent.specialty}</div>
                          <div className="text-xs text-[#6C757D] mt-1 font-mono">ID: {agent.id.slice(0, 8)}</div>
                        </div>
                      </div>

                      <div className="space-y-8">
                         {agent.bio && (
                           <div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-[#6C757D] mb-2">Specialist Bio</div>
                              <p className="text-base italic text-[#6C757D] dark:text-[#B0B0B0] leading-relaxed">"{agent.bio}"</p>
                           </div>
                         )}
                         <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D]">
                               <div className="font-bold mb-1 text-xs text-[#6C757D] uppercase">Experience</div>
                               <div className="text-rosePink font-black text-xl">{agent.experience} Years</div>
                            </div>
                            <div className="p-6 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D]">
                               <div className="font-bold mb-1 text-xs text-[#6C757D] uppercase">Location</div>
                               <div className="text-rosePink font-black text-xl truncate">{agent.location || 'Nigeria'}</div>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#6C757D] mb-6">Credential Review</div>
                        <div className="space-y-3 mb-10">
                          <ChecklistItem label="Professional Identity & Profile Complete" />
                          <ChecklistItem label="Service Location / Mode Specified" />
                          <ChecklistItem label="Experience Declared" />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          disabled={processingId === agent.id}
                          onClick={() => handleVerify(agent.id)}
                          className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>{processingId === agent.id ? 'Updating...' : 'Approve & Verify'}</span>
                        </button>
                        <button 
                          disabled={processingId === agent.id}
                          onClick={() => handleReject(agent.id)}
                          className="flex-1 py-5 bg-[#F8F9FA] dark:bg-[#0D0D0D] text-red-500 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-[3rem] p-16 text-center border border-[#E9ECEF] dark:border-[#2D2D2D]">
                <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-serif font-bold mb-2">No Pending Verifications</h3>
                <p className="text-[#6C757D]">All registered beauty specialists are verified or handled.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map(agent => (
              <div key={agent.id} className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-4 mb-6">
                    {agent.image ? (
                      <img src={agent.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-rosePink/10 text-rosePink flex items-center justify-center font-bold">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-bold">{agent.name}</h4>
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${agent.verificationStatus === VerificationStatus.VERIFIED ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {agent.verificationStatus}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[#6C757D] space-y-2 mb-6">
                    <div><strong>Specialty:</strong> {agent.specialty}</div>
                    <div><strong>Location:</strong> {agent.location}</div>
                    <div><strong>Experience:</strong> {agent.experience} years</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {agent.verificationStatus !== VerificationStatus.VERIFIED && (
                    <button 
                      onClick={() => handleVerify(agent.id)}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
                    >
                      Approve
                    </button>
                  )}
                  {agent.verificationStatus !== VerificationStatus.REJECTED && (
                    <button 
                      onClick={() => handleReject(agent.id)}
                      className="flex-1 py-3 bg-gray-100 dark:bg-white/10 text-red-500 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
                    >
                      Reject / Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
              <div className="text-xs font-black uppercase tracking-widest text-[#6C757D] mb-4">Total Registered Specialists</div>
              <div className="text-5xl font-black font-serif text-rosePink">{agents.length}</div>
            </div>
            <div className="p-10 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
              <div className="text-xs font-black uppercase tracking-widest text-[#6C757D] mb-4">Verified Specialists</div>
              <div className="text-5xl font-black font-serif text-green-500">{verifiedAgents.length}</div>
            </div>
            <div className="p-10 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
              <div className="text-xs font-black uppercase tracking-widest text-[#6C757D] mb-4">Pending Review</div>
              <div className="text-5xl font-black font-serif text-orange-500">{pendingAgents.length}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const ChecklistItem: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center space-x-4 p-4 bg-[#F8F9FA] dark:bg-[#0D0D0D] rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]">
    <div className="w-5 h-5 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
      <CheckCircle className="w-3.5 h-3.5" />
    </div>
    <span className="text-xs font-bold">{label}</span>
  </div>
);

export default AdminDashboard;
