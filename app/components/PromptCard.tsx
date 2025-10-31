"use client";

import { useState, useRef } from "react";

type Model = "openai/gpt-5" | "openai/gpt-4o";

export default function PromptCard() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<Model>("openai/gpt-4o");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAnswer("");
    setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const url = streaming ? "/.netlify/functions/chat?stream=1" : "/.netlify/functions/chat";
      
      if (streaming) {
        // Streaming response
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Request failed");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Streaming not supported");
        }

        let accumulatedAnswer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                setLoading(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  accumulatedAnswer += parsed.chunk;
                  setAnswer(accumulatedAnswer);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } else {
        // Non-streaming response
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }),
          signal: abortControllerRef.current.signal
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Request failed");
        }

        setAnswer(data.answer || "");
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        setError("Request cancelled");
      } else {
        setError((err as Error).message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAbort = () => {
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-card border border-border rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="model" className="block text-sm font-medium mb-2">
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value as Model)}
            className="w-full px-4 py-3 bg-background border border-border rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors"
            disabled={loading}
          >
            <option value="openai/gpt-4o">GPT-4o</option>
            <option value="openai/gpt-5">GPT-5</option>
          </select>
        </div>

        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full px-4 py-3 bg-background border border-border rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 min-h-[120px] resize-y transition-colors"
            disabled={loading}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {prompt.length} / 2000 characters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="streaming"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
            disabled={loading}
          />
          <label htmlFor="streaming" className="text-sm cursor-pointer">
            Stream responses
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {loading && (
            <button
              type="button"
              onClick={handleAbort}
              className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2 transition-colors font-medium"
            >
              Abort
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm" role="alert">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-8 p-6 bg-background border border-border rounded-md">
          <h3 className="text-sm font-medium mb-3">Response:</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">
              {answer}
              {loading && <span className="typing-cursor">|</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
