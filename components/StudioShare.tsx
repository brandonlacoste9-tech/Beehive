"use client";

import { FormEvent, useMemo, useState } from "react";

type Mood = "celebrate" | "tweak" | "question";

type ThreadMessage = {
  id: string;
  author: string;
  mood: Mood;
  body: string;
  createdAt: string;
};

type Thread = {
  id: string;
  title: string;
  purpose: string;
  participants: string[];
  status: "Open" | "Reviewing" | "Shipped";
  messages: ThreadMessage[];
};

const initialThreads: Thread[] = [
  {
    id: "anthem",
    title: "Launch Anthem",
    purpose: "Final polish on the voice + motion package for the public launch clip.",
    participants: ["Tristan", "Nyx", "Echo", "Jules"],
    status: "Reviewing",
    messages: [
      {
        id: "anthem-1",
        author: "Nyx",
        mood: "tweak",
        body: "Layer in a softer bed underneath the main synth so the vocals have room to breathe.",
        createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      },
      {
        id: "anthem-2",
        author: "Echo",
        mood: "celebrate",
        body: "Blend looks great in 4K playback. Ship-ready once the harmony pass lands.",
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      },
    ],
  },
  {
    id: "playbook",
    title: "Operator Playbook",
    purpose: "Collect rituals, shortcuts, and gotchas for the new studio operators.",
    participants: ["Tristan", "Mira"],
    status: "Open",
    messages: [
      {
        id: "playbook-1",
        author: "Mira",
        mood: "question",
        body: "Do we snapshot the Codex voice settings per project, or share the global profile?",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: "retroswarm",
    title: "Retroswarm",
    purpose: "Drop async notes from the last hive sync and vote on next moves.",
    participants: ["Nyx", "Echo", "Tristan", "Sol"],
    status: "Shipped",
    messages: [
      {
        id: "retroswarm-1",
        author: "Sol",
        mood: "celebrate",
        body: "Loved how RenderPulse lights up when the rituals close. Keeps everyone aligned.",
        createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      },
      {
        id: "retroswarm-2",
        author: "Tristan",
        mood: "tweak",
        body: "Next swarm: explore Codex CLI automations for QA and share findings here.",
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
    ],
  },
];

const moodCopy: Record<Mood, { label: string; tone: string; bg: string; text: string }> = {
  celebrate: {
    label: "Celebrate",
    tone: "Wins logged",
    bg: "bg-emerald-500/15",
    text: "text-emerald-200",
  },
  tweak: {
    label: "Tweak",
    tone: "Adjustments queued",
    bg: "bg-amber-500/15",
    text: "text-amber-200",
  },
  question: {
    label: "Question",
    tone: "Clarity requested",
    bg: "bg-sky-500/15",
    text: "text-sky-200",
  },
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function StudioShare() {
  const [threads, setThreads] = useState<Thread[]>(() => initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>(initialThreads[0]?.id ?? "");
  const [draftBody, setDraftBody] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("Tristan");
  const [draftMood, setDraftMood] = useState<Mood>("celebrate");
  const [newTitle, setNewTitle] = useState("");
  const [newPurpose, setNewPurpose] = useState("");

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId],
  );

  const handleSubmitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftBody.trim() || !activeThread) return;

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              messages: [
                ...thread.messages,
                {
                  id: createId(),
                  author: draftAuthor.trim() || "Anonymous",
                  mood: draftMood,
                  body: draftBody.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : thread,
      ),
    );
    setDraftBody("");
  };

  const handleCreateThread = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) return;

    const thread: Thread = {
      id: createId(),
      title: newTitle.trim(),
      purpose: newPurpose.trim() || "Shared space for the swarm.",
      participants: [draftAuthor || "Tristan"],
      status: "Open",
      messages: [
        {
          id: createId(),
          author: draftAuthor.trim() || "Tristan",
          mood: "question",
          body: "Thread opened. Drop updates and feedback below.",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setThreads((current) => [thread, ...current]);
    setActiveThreadId(thread.id);
    setNewTitle("");
    setNewPurpose("");
  };

  const sortedMessages = useMemo(() => {
    if (!activeThread) return [] as ThreadMessage[];
    return [...activeThread.messages].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [activeThread]);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white shadow-2xl">
      <header className="border-b border-white/10 p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Studio Share</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Collaborative Threads</h2>
        <p className="mt-3 text-sm text-gray-300">
          Spin up rituals, capture async feedback, and keep the swarm aligned even when everyone is off-grid.
        </p>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[18rem,1fr]">
        <aside className="space-y-4">
          <form onSubmit={handleCreateThread} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-200">Spawn a new thread</h3>
            <label className="mt-3 block text-xs font-medium text-gray-300">
              Title
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Render pipeline QA"
                className="mt-1 w-full rounded-lg border border-white/10 bg-gray-950/70 p-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-gray-300">
              Purpose
              <textarea
                value={newPurpose}
                onChange={(event) => setNewPurpose(event.target.value)}
                placeholder="Why are we gathering the swarm?"
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-gray-950/70 p-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              Create thread
            </button>
          </form>

          <nav className="space-y-2">
            {threads.map((thread) => {
              const isActive = thread.id === activeThread?.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-amber-400/60 bg-amber-500/10"
                      : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{thread.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-300">{thread.purpose}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-gray-400">
                    <span className="rounded-full border border-white/10 px-2 py-0.5">{thread.participants.length} in swarm</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5">{thread.status}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5">{thread.messages.length} notes</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
          {activeThread ? (
            <>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{activeThread.title}</h3>
                    <p className="mt-1 max-w-xl text-sm text-gray-300">{activeThread.purpose}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p className="font-semibold uppercase tracking-wide">Participants</p>
                    <p>{activeThread.participants.join(", ")}</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-4">
                  {sortedMessages.map((message) => {
                    const moodStyles = moodCopy[message.mood];
                    return (
                      <li key={message.id} className="rounded-2xl border border-white/5 bg-gray-950/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                              {message.author}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${moodStyles.bg} ${moodStyles.text}`}>
                              {moodStyles.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-gray-200">{message.body}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-gray-500">
                          {moodStyles.tone}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <form onSubmit={handleSubmitMessage} className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-gray-950/70 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex-1 min-w-[10rem] text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Author
                    <input
                      value={draftAuthor}
                      onChange={(event) => setDraftAuthor(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Mood
                    <select
                      value={draftMood}
                      onChange={(event) => setDraftMood(event.target.value as Mood)}
                      className="mt-1 rounded-lg border border-white/10 bg-black/40 p-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="celebrate">Celebrate</option>
                      <option value="tweak">Tweak</option>
                      <option value="question">Question</option>
                    </select>
                  </label>
                </div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Feedback
                  <textarea
                    value={draftBody}
                    onChange={(event) => setDraftBody(event.target.value)}
                    placeholder="Drop your note for the swarm..."
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
                  <span>
                    Notes land in chronological order so async collaborators always catch the latest signal.
                  </span>
                  <button
                    type="submit"
                    className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!draftBody.trim()}
                  >
                    Post to thread
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-gray-400">
              <p>No threads yet. Start one to gather the swarm.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
