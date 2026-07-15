export function calculateScore(query: string, text: string): number {
  if (!text || !query) return 0;
  
  const lowerQuery = query.toLowerCase().trim();
  const lowerText = text.toLowerCase().trim();
  
  if (lowerText === lowerQuery) {
    return 100;
  }
  
  if (lowerText.includes(lowerQuery)) {
    return 80;
  }
  
  // Split into keywords
  const keywords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  let score = 0;
  
  let keywordMatches = 0;
  for (const kw of keywords) {
    if (lowerText.includes(kw)) {
      keywordMatches++;
      score += 10;
    }
  }
  
  if (keywordMatches > 0) {
    // Add bonus if multiple keywords match
    score += (keywordMatches * 10);
  }
  
  return score;
}

export function rankKnowledge(
  results: any[],
  query: string
) {
  const lowerQuery = query.toLowerCase().trim();
  const keywords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

  return results.map(item => {
    let score = 0;

    // Exact question match
    if (item.question.toLowerCase().trim() === lowerQuery) {
      score += 100;
    } else if (item.question.toLowerCase().includes(lowerQuery)) {
      score += 80;
    } else {
      score += calculateScore(query, item.question) * 0.5;
    }

    // Category match
    if (item.category && item.category.toLowerCase() === lowerQuery) {
      score += 50;
    }

    // Tag match
    if (item.tags && item.tags.length > 0) {
      const tagMatch = item.tags.some((tag: string) => tag.toLowerCase() === lowerQuery);
      if (tagMatch) {
        score += 70;
      }
      
      const partialTagMatch = item.tags.some((tag: string) => 
        keywords.some(kw => tag.toLowerCase().includes(kw))
      );
      if (partialTagMatch && !tagMatch) {
        score += 30;
      }
    }

    // Answer contains keyword
    let answerScore = 0;
    for (const kw of keywords) {
      if (item.answer.toLowerCase().includes(kw)) {
        answerScore += 40;
        break; // Max one bonus for answer
      }
    }
    score += answerScore;

    // Priority bonus
    if (item.priority) {
      score += item.priority * 10;
    }

    return {
      ...item,
      score
    };
  }).sort((a, b) => b.score - a.score);
}


export function rankListings(
  results: any[],
  query: string
) {
  const lowerQuery = query.toLowerCase().trim();
  const keywords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

  return results.map(item => {
    let score = 0;

    // Title match
    if (item.title.toLowerCase().trim() === lowerQuery) {
      score += 100;
    } else if (item.title.toLowerCase().includes(lowerQuery)) {
      score += 80;
    } else {
      score += calculateScore(query, item.title) * 0.5;
    }

    // Property Type match
    if (item.property_type && item.property_type.toLowerCase() === lowerQuery) {
      score += 50;
    } else if (item.property_type && item.property_type.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }

    // Amenities match
    if (item.amenities && item.amenities.length > 0) {
      const amenityMatch = item.amenities.some((a: string) => a.toLowerCase() === lowerQuery);
      if (amenityMatch) {
        score += 70;
      }
      
      const partialAmenityMatch = item.amenities.some((a: string) => 
        keywords.some(kw => a.toLowerCase().includes(kw))
      );
      if (partialAmenityMatch && !amenityMatch) {
        score += 30;
      }
    }

    // Description contains keyword
    let descScore = 0;
    for (const kw of keywords) {
      if (item.description.toLowerCase().includes(kw)) {
        descScore += 40;
        break; // Max one bonus for description
      }
    }
    score += descScore;

    return {
      ...item,
      score
    };
  }).sort((a, b) => b.score - a.score);
}
