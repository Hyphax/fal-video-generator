"use client";

import React from "react";

type JobBody = {
  prompt: string;
  width?: number;
  height?: number;
  num_frames?: number;
  steps?: number;
  guidance_scale?: number;
};

export default function VideoGenerator() {
  const [prompt, setPrompt] = React.useState(
    "cinematic drone shot over tea fields at sunrise, mist, golden light"
  );

  // Safe WAN defaults (divisible by 16; (frames-1)%4==0)
  const [width, setWidth] = React.useState(960);
  const [height, setHeight] = React.useState(544);
  const [numFrames, setNumFrames] = React.useState(193); // ~8s @24fps
  const [steps, setSteps] = React.useState(24);
  const [guidance, setGuidance] = React.useState(4.0);

  const [isRunning, setIsRunning] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);

  function clamp16(n: number) {
    return Math.max(16, Math.round(n / 16) * 16);
  }
  function fixFrames(n: number) {
    // Make (n-1) divisible by 4
    return Math.max(5, Math.round((n - 1) / 4) * 4 + 1);
  }

  async function runGeneration(input: JobBody) {
    const body = {
      prompt: input.prompt,
      width: clamp16(input.width ?? width),
      height: clamp16(input.height ?? height),
      num_frames: fixFrames(input.num_frames ?? numFrames),
      steps: input.steps ?? steps,
      guidance_scale: input.guidance_scale ?? guidance,
    };

    const start = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!start.ok) {
      throw new Error(`Start failed: ${await start.text()}`);
    }
    const { job_id } = await start.json();

    let s = "running";
    let err: string | undefined;
    setStatus("running");

    while (s === "running") {
      await new Promise((r) => setTimeout(r, 1500));
      const r = await fetch(`/api/jobs/${job_id}`, { cache: "no-store" });
      const j = await r.json();
      s = j.status;
      err = j.error;
      setStatus(s);
    }

    if (s !== "done") {
      throw new Error(err ?? "Unknown error");
    }

    const v = await fetch(`/api/result/${job_id}`, { cache: "no-store" });
    const blob = await v.blob();
    return URL.createObjectURL(blob);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsRunning(true);
    setError(null);
    setVideoUrl(null);
    setStatus("queued");

    try {
      const url = await runGeneration({
        prompt,
        width,
        height,
        num_frames: numFrames,
        steps,
        guidance_scale: guidance,
      });
      setVideoUrl(url);
      setStatus("done");
    } catch (e: any) {
      setError(String(e.message ?? e));
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">WAN 2.2 Video Generator (UI)</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Prompt</span>
          <textarea
            className="mt-1 w-full rounded-xl border p-3"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <label className="text-sm">
            Width
            <input
              type="number"
              className="mt-1 w-full rounded-xl border p-2"
              value={width}
              onChange={(e) => setWidth(clamp16(Number(e.target.value)))}
            />
          </label>

          <label className="text-sm">
            Height
            <input
              type="number"
              className="mt-1 w-full rounded-xl border p-2"
              value={height}
              onChange={(e) => setHeight(clamp16(Number(e.target.value)))}
            />
          </label>

          <label className="text-sm">
            Frames
            <input
              type="number"
              className="mt-1 w-full rounded-xl border p-2"
              value={numFrames}
              onChange={(e) => setNumFrames(fixFrames(Number(e.target.value)))}
            />
          </label>

          <label className="text-sm">
            Steps
            <input
              type="number"
              className="mt-1 w-full rounded-xl border p-2"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
            />
          </label>

          <label className="text-sm">
            Guidance
            <input
              type="number"
              step="0.1"
              className="mt-1 w-full rounded-xl border p-2"
              value={guidance}
              onChange={(e) => setGuidance(Number(e.target.value))}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isRunning}
          className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-60"
        >
          {isRunning ? "Generating…" : "Generate"}
        </button>
      </form>

      {status && (
        <div className="text-sm">
          <b>Status:</b> {status}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600">
          <b>Error:</b> {error}
        </div>
      )}
      {videoUrl && (
        <video
          src={videoUrl}
          controls
          className="w-full rounded-xl border"
          autoPlay
          playsInline
        />
      )}
      <p className="text-xs text-gray-500">
        Rules enforced: width/height divisible by 16; (frames − 1) divisible by 4.
      </p>
    </div>
  );
}
