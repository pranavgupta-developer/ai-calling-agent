export function rankResults(results: any[], originalQuery: string) {
  // In a production system, this could use a re-ranking model (e.g. Cohere Rerank)
  // For now, we sort by similarity if available, and apply a minor keyword boost
  
  const queryWords = originalQuery.toLowerCase().split(/\W+/).filter(w => w.length > 2);

  const ranked = results.map(result => {
    let score = result.similarity || 0;
    
    // Keyword boost
    const text = `${result.question} ${result.answer} ${result.keywords?.join(' ')}`.toLowerCase();
    
    let matchCount = 0;
    for (const word of queryWords) {
      if (text.includes(word)) {
        matchCount++;
      }
    }
    
    // Slight boost for exact keyword matches
    score += (matchCount * 0.01);
    
    // Priority boost
    if (result.priority === 'HIGH') score += 0.05;
    if (result.priority === 'LOW') score -= 0.02;

    return {
      ...result,
      finalScore: score
    };
  });

  return ranked.sort((a, b) => b.finalScore - a.finalScore);
}
