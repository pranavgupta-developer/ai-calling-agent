import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../../features/knowledge-base/ai/embeddings';

const DEFAULT_CATEGORIES = [
  { name: 'Buying', description: 'Questions about buying a property', color: '#10b981', icon: 'home' },
  { name: 'Selling', description: 'Questions about selling a property', color: '#3b82f6', icon: 'tag' },
  { name: 'Rental', description: 'Questions about renting properties', color: '#f59e0b', icon: 'key' },
  { name: 'Commercial', description: 'Commercial real estate FAQs', color: '#8b5cf6', icon: 'building' },
  { name: 'Loans', description: 'Mortgages and financing', color: '#ef4444', icon: 'dollar-sign' },
  { name: 'Legal', description: 'Legal and paperwork questions', color: '#64748b', icon: 'file-text' },
  { name: 'Investment', description: 'Property investment inquiries', color: '#14b8a6', icon: 'trending-up' },
  { name: 'Taxes', description: 'Tax related questions', color: '#f97316', icon: 'calculator' },
  { name: 'Appointments', description: 'Scheduling and meetings', color: '#ec4899', icon: 'calendar' },
  { name: 'Pricing', description: 'Fees and pricing details', color: '#06b6d4', icon: 'credit-card' },
];

const DEFAULT_ENTRIES = [
  // Buying
  { category: 'Buying', question: 'What documents do I need to buy a house?', answer: 'To buy a house, you typically need proof of identity (passport or driver\'s license), proof of income (recent pay stubs, W-2s, or tax returns), bank statements for the last 2-3 months, and a mortgage pre-approval letter.', keywords: ['documents', 'buy', 'requirements', 'paperwork'] },
  { category: 'Buying', question: 'How much down payment do I need?', answer: 'While a 20% down payment is standard to avoid private mortgage insurance (PMI), many lenders accept as little as 3% to 5% for first-time buyers, and VA or USDA loans may require 0% down.', keywords: ['down payment', 'minimum', 'PMI', 'deposit'] },
  { category: 'Buying', question: 'What are closing costs?', answer: 'Closing costs are fees associated with finalizing your mortgage. They typically range from 2% to 5% of the purchase price and include appraisal fees, title insurance, loan origination fees, and escrow payments.', keywords: ['closing costs', 'fees', 'finalizing'] },
  { category: 'Buying', question: 'How long does it take to close on a house?', answer: 'The average closing process takes 30 to 45 days after the seller accepts your offer. This allows time for the appraisal, inspection, and loan underwriting.', keywords: ['closing time', 'timeline', 'duration'] },
  { category: 'Buying', question: 'Should I get a home inspection?', answer: 'Yes, a home inspection is highly recommended. It uncovers hidden issues like structural damage, plumbing problems, or electrical hazards before you finalize the purchase.', keywords: ['inspection', 'issues', 'safety'] },
  
  // Selling
  { category: 'Selling', question: 'How much is my home worth?', answer: 'Your home\'s value depends on its location, condition, size, and recent sales of comparable properties (comps) in your area. We can provide a free Comparative Market Analysis (CMA) to determine the exact price.', keywords: ['worth', 'value', 'price', 'CMA'] },
  { category: 'Selling', question: 'Should I renovate before selling?', answer: 'It depends on the condition of your home and the local market. Minor updates like painting, landscaping, and decluttering usually offer the best return on investment. Major renovations might not recoup their full cost.', keywords: ['renovate', 'updates', 'repairs', 'ROI'] },
  { category: 'Selling', question: 'How long will it take to sell my house?', answer: 'The time on market varies widely by location and season. On average, homes sell in about 30 to 60 days, but pricing accurately from the start is the best way to ensure a quick sale.', keywords: ['time to sell', 'days on market', 'speed'] },
  { category: 'Selling', question: 'What are the costs of selling a house?', answer: 'Selling costs typically include agent commissions (usually 5-6%), closing costs (1-3%), staging or repair costs, and potential seller concessions.', keywords: ['selling costs', 'fees', 'commission'] },
  { category: 'Selling', question: 'Do I need a real estate agent to sell?', answer: 'While you can sell "For Sale By Owner" (FSBO), using an agent generally results in a higher sale price, broader marketing reach, and professional negotiation that offsets the commission cost.', keywords: ['agent', 'realtor', 'FSBO', 'help'] },

  // Rental
  { category: 'Rental', question: 'What is required to rent a property?', answer: 'Prospective tenants usually need to provide a government-issued ID, proof of income (pay stubs or bank statements), rental history references, and consent for a background/credit check.', keywords: ['rent', 'requirements', 'tenant'] },
  { category: 'Rental', question: 'How much is the security deposit?', answer: 'Security deposits typically equal one to two months\' rent, depending on the property and your credit history. It is refundable at the end of the lease if no damage occurs.', keywords: ['security deposit', 'deposit', 'refundable'] },
  { category: 'Rental', question: 'Are pets allowed?', answer: 'Pet policies vary by property. Some allow all pets, some restrict breed/size, and others do not allow pets at all. Additional pet deposits or monthly pet rent may apply.', keywords: ['pets', 'dogs', 'cats', 'policy'] },
  { category: 'Rental', question: 'Who is responsible for maintenance?', answer: 'Generally, the landlord is responsible for major repairs (plumbing, HVAC, appliances), while the tenant is responsible for basic upkeep like changing air filters and lightbulbs. Check your specific lease agreement.', keywords: ['maintenance', 'repairs', 'fix'] },
  { category: 'Rental', question: 'Can I break my lease early?', answer: 'Breaking a lease usually incurs a penalty, such as forfeiting your security deposit or paying a fee equal to 1-2 months\' rent. Some leases have early termination clauses.', keywords: ['break lease', 'early termination', 'penalty'] },

  // Commercial
  { category: 'Commercial', question: 'What is a triple net (NNN) lease?', answer: 'A triple net lease requires the tenant to pay for property taxes, insurance, and maintenance costs in addition to the base rent.', keywords: ['triple net', 'NNN', 'commercial lease'] },
  { category: 'Commercial', question: 'How is commercial property valued?', answer: 'Commercial real estate is primarily valued based on its income-producing potential using the capitalization rate (cap rate), rather than just comparable sales.', keywords: ['commercial value', 'cap rate', 'valuation'] },
  { category: 'Commercial', question: 'What are CAM charges?', answer: 'CAM (Common Area Maintenance) charges are fees paid by tenants to cover the cost of maintaining shared spaces like parking lots, lobbies, and landscaping.', keywords: ['CAM', 'maintenance fees', 'shared space'] },
  { category: 'Commercial', question: 'What is the typical commercial lease term?', answer: 'Commercial leases typically run for 3 to 10 years, which is much longer than standard residential leases (usually 1 year).', keywords: ['lease term', 'duration', 'length'] },
  { category: 'Commercial', question: 'Do you help with zoning issues?', answer: 'Yes, our commercial specialists can help you navigate local zoning laws to ensure a property is suitable for your intended business use.', keywords: ['zoning', 'laws', 'usage', 'permits'] },

  // Loans
  { category: 'Loans', question: 'What is the difference between fixed and adjustable rate mortgages?', answer: 'A fixed-rate mortgage has an interest rate that stays the same for the life of the loan. An adjustable-rate mortgage (ARM) has a fixed rate for an initial period, after which the rate adjusts periodically based on the market.', keywords: ['fixed rate', 'ARM', 'mortgage types'] },
  { category: 'Loans', question: 'What is PMI?', answer: 'Private Mortgage Insurance (PMI) is required by lenders when a buyer puts down less than 20%. It protects the lender in case the borrower defaults on the loan.', keywords: ['PMI', 'insurance', 'less than 20%'] },
  { category: 'Loans', question: 'How do I get pre-approved?', answer: 'To get pre-approved, you must submit financial documents to a lender, who will check your credit score and verify your income and debt to determine how much they are willing to lend you.', keywords: ['pre-approved', 'loan application', 'mortgage'] },
  { category: 'Loans', question: 'What credit score do I need to buy a house?', answer: 'While conventional loans usually require a score of 620 or higher, some government-backed loans (like FHA) accept scores as low as 500-580 with a higher down payment.', keywords: ['credit score', 'FICO', 'minimum score'] },
  { category: 'Loans', question: 'What are points on a mortgage?', answer: 'Discount points are fees paid directly to the lender at closing in exchange for a reduced interest rate. One point costs 1% of your mortgage amount.', keywords: ['points', 'discount points', 'interest rate'] },

  // Legal
  { category: 'Legal', question: 'What is title insurance?', answer: 'Title insurance protects both the buyer and the lender from financial loss due to defects in a property\'s title, such as outstanding liens, unpaid taxes, or ownership disputes.', keywords: ['title insurance', 'protection', 'liens'] },
  { category: 'Legal', question: 'What happens if the appraisal is lower than the offer?', answer: 'If the appraisal is low, the lender won\'t finance the full amount. You can renegotiate the price with the seller, pay the difference in cash, or walk away if you have an appraisal contingency.', keywords: ['low appraisal', 'appraisal gap', 'valuation issue'] },
  { category: 'Legal', question: 'What is earnest money?', answer: 'Earnest money is a good faith deposit made by the buyer when an offer is accepted. It is typically 1-3% of the purchase price and is held in escrow until closing.', keywords: ['earnest money', 'deposit', 'good faith'] },
  { category: 'Legal', question: 'Do I need a real estate attorney?', answer: 'Requirements vary by state. Some states require an attorney to handle real estate closings, while others use title or escrow companies. It is always a good idea for complex transactions.', keywords: ['attorney', 'lawyer', 'legal counsel'] },
  { category: 'Legal', question: 'What is a contingency in a real estate contract?', answer: 'A contingency is a condition that must be met for the contract to become binding. Common contingencies include financing, appraisal, and home inspection.', keywords: ['contingency', 'condition', 'contract terms'] },

  // Investment
  { category: 'Investment', question: 'What is a 1031 exchange?', answer: 'A 1031 exchange allows an investor to defer paying capital gains taxes on an investment property when it is sold, as long as another "like-kind" property is purchased with the profit.', keywords: ['1031 exchange', 'tax deferral', 'capital gains'] },
  { category: 'Investment', question: 'What is a good ROI for real estate?', answer: 'A good Return on Investment (ROI) is highly subjective and depends on your goals, but many investors aim for an annual return of 8% to 12% on residential properties.', keywords: ['ROI', 'return', 'profitability'] },
  { category: 'Investment', question: 'What is house flipping?', answer: 'House flipping involves buying a property, renovating it, and selling it for a profit within a short timeframe, usually a few months.', keywords: ['house flipping', 'fix and flip', 'renovation'] },
  { category: 'Investment', question: 'Should I invest in single-family or multi-family properties?', answer: 'Single-family homes are generally easier to finance and sell, while multi-family properties offer economies of scale and multiple income streams. The best choice depends on your capital and experience.', keywords: ['single-family', 'multi-family', 'investment type'] },
  { category: 'Investment', question: 'What is the 1% rule?', answer: 'The 1% rule is a rule of thumb used by investors. It suggests that a property\'s monthly rent should be at least 1% of its total purchase price to be considered a good investment.', keywords: ['1% rule', 'rent ratio', 'investment metric'] },

  // Taxes
  { category: 'Taxes', question: 'Are property taxes included in my mortgage?', answer: 'Yes, if you have an escrow account. The lender collects a portion of your annual property taxes with your monthly payment and pays the tax bill on your behalf when it\'s due.', keywords: ['property taxes', 'escrow', 'mortgage payment'] },
  { category: 'Taxes', question: 'Are mortgage interest payments tax-deductible?', answer: 'For most homeowners, the interest paid on the first $750,000 of mortgage debt is tax-deductible if they itemize their deductions. Consult a tax professional for specific advice.', keywords: ['tax deduction', 'mortgage interest', 'write-off'] },
  { category: 'Taxes', question: 'How are capital gains taxes calculated on a home sale?', answer: 'If you have lived in the home as your primary residence for 2 of the last 5 years, you can exclude up to $250,000 (or $500,000 for married couples) of profit from capital gains taxes.', keywords: ['capital gains', 'tax exclusion', 'profit tax'] },

  // Appointments
  { category: 'Appointments', question: 'How do I schedule a property viewing?', answer: 'You can schedule a property viewing by calling our office, using the contact form on our website, or directly through the specific property listing page.', keywords: ['schedule viewing', 'tour', 'see property'] },
  { category: 'Appointments', question: 'Do I need an appointment to visit an open house?', answer: 'No, you do not need an appointment for a scheduled public open house. You can just walk in during the designated hours.', keywords: ['open house', 'visit', 'appointment'] },

  // Pricing
  { category: 'Pricing', question: 'How much does it cost to use a buyer\'s agent?', answer: 'Traditionally, the buyer\'s agent commission is paid by the seller from the proceeds of the sale, meaning there is usually no direct cost to the buyer. However, policies can vary.', keywords: ['buyer agent fee', 'commission', 'cost to buy'] },
  { category: 'Pricing', question: 'Are there hidden fees when renting?', answer: 'Beyond rent and the security deposit, you may encounter application fees, pet fees, parking fees, or utility setup fees. We ensure all potential costs are clearly stated before you sign a lease.', keywords: ['hidden fees', 'renting costs', 'extra charges'] }
];

export async function seedKnowledgeBase(supabase: any, agencyId: string) {
  try {
    console.log(`Seeding Knowledge Base for Agency: ${agencyId}`);

    // Insert Categories
    const categoriesWithAgency = DEFAULT_CATEGORIES.map(c => ({
      ...c,
      agency_id: agencyId
    }));

    const { data: insertedCategories, error: categoryError } = await supabase
      .from('knowledge_categories')
      .insert(categoriesWithAgency)
      .select();

    if (categoryError) throw categoryError;
    console.log(`Inserted ${insertedCategories.length} categories.`);

    // Map category names to IDs
    const categoryMap = new Map();
    insertedCategories.forEach((c: any) => categoryMap.set(c.name, c.id));

    // Insert Entries in chunks or sequentially to handle embeddings
    const entriesWithAgencyAndCategory = [];
    console.log(`Generating embeddings for ${DEFAULT_ENTRIES.length} entries...`);
    
    for (let i = 0; i < DEFAULT_ENTRIES.length; i++) {
      const e = DEFAULT_ENTRIES[i];
      const embedding = await generateEmbedding(`${e.question}\n\n${e.answer}`);
      
      entriesWithAgencyAndCategory.push({
        agency_id: agencyId,
        category_id: categoryMap.get(e.category),
        question: e.question,
        answer: e.answer,
        keywords: e.keywords,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        is_ai_enabled: true,
        source_type: 'DEFAULT_FAQ',
        embedding: embedding,
        search_text: `${e.question} ${e.answer} ${e.keywords.join(' ')}`
      });
      
      if (i % 5 === 0 && i > 0) console.log(`Processed ${i}/${DEFAULT_ENTRIES.length} embeddings...`);
    }

    const { data: insertedEntries, error: entryError } = await supabase
      .from('knowledge_entries')
      .insert(entriesWithAgencyAndCategory)
      .select();

    if (entryError) throw entryError;
    console.log(`Inserted ${insertedEntries.length} knowledge entries.`);

    return { success: true, count: insertedEntries.length };
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    return { success: false, error };
  }
}
