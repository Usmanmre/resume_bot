

export default function chunkText(text: string): string[] {
  const chunkSize = Number(process.env.CHUNK_SIZE) || 800;
  const overlapSize = Number(process.env.OVERLAP_SIZE) || 150;
  // Guard check: prevent infinite loops if overlap is accidentally set larger than or equal to chunk size
  if (overlapSize >= chunkSize) {
    throw new Error("Overlap size must be smaller than the chunk size.");
  }

  const chunks: string[] = [];
  const step = chunkSize - overlapSize;

  for (let i = 0; i < text.length; i += step) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    
    // Optional check: Stop if the loop has reached the end of the text string
    if (i + chunkSize >= text.length) {
      break;
    }
  }

  return chunks;
}