import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ExternalLink, LogIn, MessageCircle, Users, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchCommunities, fetchCommunityPosts, joinCommunity, leaveCommunity } from "../services/community.js";
import { BLUE, NAVY, NAVY_SOFT } from "../theme";

export default function CommunityView() {
  const { user, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get("community");
  const [communities, setCommunities] = useState([]);
  const [selectedId, setSelectedId] = useState(requestedId || null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCommunities(user?.id).then((items) => {
      if (!active) return;
      setCommunities(items);
      setSelectedId((current) => {
        if (requestedId && items.some((item) => String(item.id) === String(requestedId))) return requestedId;
        if (current && items.some((item) => String(item.id) === String(current))) return current;
        return items.find((item) => item.isJoined)?.id || items[0]?.id || null;
      });
      setLoading(false);
    });
    return () => { active = false; };
  }, [user, requestedId]);

  const selected = communities.find((community) => String(community.id) === String(selectedId));
  useEffect(() => {
    if (!selected || !selected.isJoined) { setPosts([]); setPostsLoading(false); return; }
    let active = true;
    setPostsLoading(true);
    fetchCommunityPosts(selected.id).then((items) => { if (active) { setPosts(items); setPostsLoading(false); } });
    return () => { active = false; };
  }, [selected?.id]);

  const joined = useMemo(() => communities.filter((community) => community.isJoined), [communities]);
  const available = useMemo(() => communities.filter((community) => !community.isJoined), [communities]);

  const selectCommunity = (community) => {
    setSelectedId(community.id);
    navigate(`/community?community=${encodeURIComponent(community.id)}`, { replace: true });
  };

  const handleMembership = async (community) => {
    if (!isSupabaseConfigured || !user) {
      setCommunities((items) => items.map((item) => item.id === community.id ? { ...item, isJoined: !item.isJoined } : item));
      return;
    }
    setActionId(community.id);
    setError("");
    const result = community.isJoined ? await leaveCommunity(user.id, community.id) : await joinCommunity(user.id, community.id);
    setActionId(null);
    if (result.error) { setError(result.error.message); return; }
    setCommunities((items) => items.map((item) => item.id === community.id ? { ...item, isJoined: !item.isJoined } : item));
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: BLUE }}><Users size={28} className="text-white" /></div>
          <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Learn together</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Nexrnn Community</h1>
          <p className="text-slate-500 max-w-xl">Join course communities, follow announcements and ask questions with other learners.</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-5">{error}</p>}
        {loading ? <p className="text-sm text-slate-400">Loading communities…</p> : communities.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center"><Users size={32} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">No communities published yet.</p><p className="text-sm text-slate-400 mt-1">Check back after the Nexrnn team creates a community.</p></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
            <div className="space-y-6">
              <CommunityGroup title="My Communities" items={joined} selectedId={selectedId} onSelect={selectCommunity} empty="Join a community below to see it here." />
              <CommunityGroup title="Discover Communities" items={available} selectedId={selectedId} onSelect={selectCommunity} empty="You have joined every available community." showJoin onJoin={handleMembership} actionId={actionId} />
            </div>

            {selected ? (
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-6 text-white" style={{ backgroundColor: NAVY }}>
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-bold tracking-[0.16em] text-blue-200 uppercase mb-2">{selected.courseTitle || "Nexrnn Community"}</p><h2 className="text-2xl font-extrabold">{selected.name}</h2><p className="text-sm text-slate-300 mt-2 max-w-2xl">{selected.description || "Learn, ask questions and get updates from the Nexrnn team."}</p></div>
                    <button onClick={() => handleMembership(selected)} disabled={actionId === selected.id} className="shrink-0 px-3 py-2 rounded-md text-xs font-bold border border-white/20 hover:bg-white/10 disabled:opacity-50">{selected.isJoined ? "Leave" : "Join Community"}</button>
                  </div>
                </div>
                {selected.isJoined ? <div className="px-6 py-6"><div className="flex items-center justify-between mb-5"><div><h3 className="text-lg font-extrabold text-slate-900">Announcements</h3><p className="text-sm text-slate-500 mt-1">{selected.posts || posts.length} updates from the Nexrnn team</p></div><MessageCircle size={20} style={{ color: BLUE }} /></div>{postsLoading ? <p className="text-sm text-slate-400">Loading announcements…</p> : posts.length === 0 ? <div className="rounded-lg bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-700">No announcements yet.</p><p className="text-sm text-slate-400 mt-1">New updates will appear here.</p></div> : <div className="space-y-4">{posts.map((post) => <article key={post.id} className="border border-slate-200 rounded-lg p-4"><div className="flex items-start justify-between gap-3">{post.title && <h4 className="font-bold text-slate-900">{post.title}</h4>}<span className="text-[11px] text-slate-400 whitespace-nowrap">{post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span></div><p className="text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-wrap">{post.body}</p>{post.link_url && /^https?:\/\//i.test(post.link_url) && <a href={post.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold hover:underline" style={{ color: BLUE }}>Open linked resource <ExternalLink size={13} /></a>}</article>)}</div>}</div> : <div className="px-6 py-12 text-center"><MessageCircle size={32} className="mx-auto mb-3 text-slate-300" /><h3 className="font-extrabold text-slate-800">Join this community to view announcements</h3><p className="text-sm text-slate-500 mt-2">Community messages become available after you join.</p><button onClick={() => handleMembership(selected)} disabled={actionId === selected.id} className="mt-5 text-white text-sm font-bold px-4 py-2.5 rounded-md disabled:opacity-50" style={{ backgroundColor: BLUE }}>{actionId === selected.id ? "Joining…" : "Join Community"}</button></div>}
              </section>
            ) : <div className="bg-white border border-slate-200 rounded-xl p-12 text-center"><LogIn size={28} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">Select a community</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}

function CommunityGroup({ title, items, selectedId, onSelect, empty, showJoin, onJoin, actionId }) {
  return <section><div className="flex items-center justify-between mb-3"><h2 className="font-extrabold text-slate-900">{title}</h2><span className="text-xs font-bold text-slate-400">{items.length}</span></div><div className="space-y-2">{items.length === 0 ? <p className="text-sm text-slate-400 bg-white border border-dashed border-slate-200 rounded-lg p-4">{empty}</p> : items.map((community) => <div key={community.id} className={`bg-white border rounded-lg p-3 transition ${String(selectedId) === String(community.id) ? "border-blue-500 shadow-sm" : "border-slate-200"}`}><button onClick={() => onSelect(community)} className="w-full text-left"><div className="flex gap-3"><div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: NAVY_SOFT }}><Users size={16} style={{ color: BLUE }} /></div><div className="min-w-0"><p className="font-bold text-sm text-slate-800 truncate">{community.name}</p><p className="text-xs text-slate-400 mt-1">{community.posts || 0} announcements</p></div></div></button>{showJoin && <button onClick={() => onJoin(community)} disabled={actionId === community.id} className="w-full mt-3 text-xs font-bold py-2 rounded-md flex items-center justify-center gap-1.5 text-white disabled:opacity-50" style={{ backgroundColor: BLUE }}><UserPlus size={13} /> {actionId === community.id ? "Joining…" : "Join Community"}</button>}{!showJoin && community.isJoined && <p className="text-[11px] font-semibold text-green-600 flex items-center gap-1 mt-2"><Check size={12} /> Joined</p>}</div>)}</div></section>;
}
