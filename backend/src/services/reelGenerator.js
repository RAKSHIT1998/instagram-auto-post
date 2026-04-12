export async function generateReelFromScript({ script, voice = "default", clips = [] }) {
  return {
    status: "scaffold",
    message:
      "Implement pipeline: script -> Coqui TTS audio -> stock clips (Pexels) -> subtitles -> FFmpeg render",
    input: {
      script,
      voice,
      clipsCount: clips.length
    },
    reelUrl: null
  };
}
