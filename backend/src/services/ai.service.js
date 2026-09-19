import Groq from 'groq-sdk';

// List of supported Groq model candidates
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
  'llama-3.1-8b-instant'
];

export class AIService {
  /**
   * Enhances raw detected accessibility issues with plain-English explanations and side-by-side code fixes.
   * @param {Array<object>} rawIssues 
   * @returns {Promise<Array<object>>} List of enriched issue objects
   */
  static async enrichIssues(rawIssues) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.log('[AIService] No GROQ_API_KEY set. Using deterministic high-quality fallback generator.');
      return rawIssues.map((issue, idx) => this.generateFallbackRemediation(issue, idx));
    }

    try {
      const groq = new Groq({ apiKey });

      const enriched = await Promise.all(
        rawIssues.map(async (issue, idx) => {
          let parsed = null;

          const prompt = `You are a Web Accessibility (WCAG 2.1) Expert auditor.
Given the following accessibility issue:
- Category: ${issue.category}
- Severity: ${issue.severity}
- Element: ${issue.element}
- Problematic HTML Snippet: \`${issue.snippet}\`
- Context: ${issue.context}
- Standard: ${issue.wcag}

Respond ONLY with a valid JSON object matching this structure:
{
  "explanation": "Clear, plain-English explanation (2-3 sentences) describing why this issue occurs and who it affects (e.g. screen reader users, keyboard-only users, low vision users).",
  "suggestedFixCode": "The exact corrected HTML snippet replacing the problematic code.",
  "quickTip": "A 1-sentence actionable tip for developers."
}`;

          // Try available models in order
          for (const modelName of GROQ_MODELS) {
            try {
              const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: modelName,
                temperature: 0.2,
                response_format: { type: 'json_object' }
              });

              const text = chatCompletion.choices[0]?.message?.content || '{}';
              parsed = JSON.parse(text);
              if (parsed && parsed.explanation) break;
            } catch {
              // Try next model if 404/error
              continue;
            }
          }

          if (!parsed) {
            return this.generateFallbackRemediation(issue, idx);
          }

          return {
            id: `issue-${String(idx + 1).padStart(3, '0')}`,
            ruleId: issue.ruleId,
            category: issue.category,
            severity: issue.severity,
            element: issue.element,
            selector: issue.selector,
            wcag: issue.wcag,
            context: issue.context,
            originalSnippet: issue.snippet,
            explanation: parsed.explanation || issue.impact,
            suggestedFixCode: parsed.suggestedFixCode || issue.fixTemplate,
            quickTip: parsed.quickTip || 'Ensure semantic HTML and WCAG standards are followed.'
          };
        })
      );

      return enriched;
    } catch (err) {
      console.warn('[AIService] Failed to initialize Groq client, using fallback:', err.message);
      return rawIssues.map((issue, idx) => this.generateFallbackRemediation(issue, idx));
    }
  }

  /**
   * Deterministic high-quality fallback remediation generator.
   */
  static generateFallbackRemediation(issue, idx) {
    return {
      id: `issue-${String(idx + 1).padStart(3, '0')}`,
      ruleId: issue.ruleId,
      category: issue.category,
      severity: issue.severity,
      element: issue.element,
      selector: issue.selector,
      wcag: issue.wcag,
      context: issue.context,
      originalSnippet: issue.snippet,
      explanation: issue.impact,
      suggestedFixCode: issue.fixTemplate,
      quickTip: `Always test ${issue.category.toLowerCase()} elements using assistive tools and keyboard navigation.`
    };
  }
}
