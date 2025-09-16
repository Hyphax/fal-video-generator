"use client";
import React from "react";

export default function VideoGenerator() {
  const [prompt, setPrompt] = React.useState(
    "cinematic drone shot over tea fields at sunrise, mist, golden light"
  );
  const [width, setWidth] = React.useState(960);
  const [height, setHeight] = React.useState(544);
  const [frames, setFrames] = React.useState(193);
  const [steps, setSteps] = React.useState(24);
  const [guidance, setGuidance] = React.useState(4.0);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [video, setVideo] = React.useState("");

  const clamp16 = (n:number)=>Math.max(16,Math.round(n/16)*16);
  const fixFrames = (n:number)=>Math.max(5,Math.round((n-1)/4)*4+1);

  async function run() {
    setStatus("queued"); setError(""); setVideo("");
    const start = await fetch("/api/generate", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        prompt:prompt.trim(),
        width:clamp16(width),
        height:clamp16(height),
        num_frames:fixFrames(frames),
        steps,
        guidance_scale:guidance
      })
    });
    const { job_id } = await start.json();
    let s="running";
    while(s==="running"){
      await new Promise(r=>setTimeout(r,2000));
      const j=await fetch(`/api/jobs/${job_id}`).then(r=>r.json());
      s=j.status; setStatus(s);
      if(j.error){ setError(j.error); break; }
    }
    if(s==="done"){
      const blob = await fetch(`/api/result/${job_id}`).then(r=>r.blob());
      setVideo(URL.createObjectURL(blob));
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">WAN 2.2 Video Generator</h1>
      <textarea className="w-full border rounded p-3" rows={4}
        value={prompt} onChange={e=>setPrompt(e.target.value)} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <label>Width
          <input type="number" className="border p-1 w-full"
            value={width} onChange={e=>setWidth(clamp16(+e.target.value))}/>
        </label>
        <label>Height
          <input type="number" className="border p-1 w-full"
            value={height} onChange={e=>setHeight(clamp16(+e.target.value))}/>
        </label>
        <label>Frames
          <input type="number" className="border p-1 w-full"
            value={frames} onChange={e=>setFrames(fixFrames(+e.target.value))}/>
        </label>
        <label>Steps
          <input type="number" className="border p-1 w-full"
            value={steps} onChange={e=>setSteps(+e.target.value)}/>
        </label>
        <label>Guidance
          <input type="number" step="0.1" className="border p-1 w-full"
            value={guidance} onChange={e=>setGuidance(+e.target.value)}/>
        </label>
      </div>
      <button onClick={run}
        className="px-4 py-2 bg-black text-white rounded disabled:opacity-60">
        Generate
      </button>
      {status && <p>Status: {status}</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {video && <video src={video} controls className="w-full rounded mt-4" />}
    </div>
  );
}
