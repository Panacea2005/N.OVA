// services/contractAnalyzer.ts
import Groq from "groq-sdk";

// Replace with your actual GROQ API key or use environment variables
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "your-groq-api-key",
  dangerouslyAllowBrowser: true
});

interface SecurityIssue {
  type: string;
  description: string;
  location?: string;
  impact: string;
  recommendation: string;
  codeExample?: string;
}

interface Optimization {
  type: string;
  description: string;
  suggestion: string;
  impact: string;
  codeExample?: string;
}

export interface ContractAnalysis {
  securityScore: number;
  scanDuration: string;
  linesOfCode: number;
  issuesCount: number;
  critical: SecurityIssue[];
  high: SecurityIssue[];
  medium: SecurityIssue[];
  low: SecurityIssue[];
  informational: SecurityIssue[];
  optimizations: Optimization[];
  modificationSuggestions?: string;
  summary?: string;
  rawAnalysis?: string;
}

export const contractAnalyzer = {
  async analyzeContract(code: string, model: string): Promise<ContractAnalysis> {
    const startTime = Date.now();
    try {
      console.log("Starting Solana program analysis...");
      
      // Generate the prompt for code analysis
      const prompt = `Analyze the following Rust code for a Solana program:

\`\`\`rust
${code}
\`\`\`

Provide a comprehensive security analysis including:
1. Security score (0-100)
2. Critical issues, high severity issues, medium severity issues, low severity issues, and informational issues specific to Solana program development
3. Specific optimizations for Solana programs
4. Suggested code modifications to improve security and efficiency

Focus on Solana-specific security concerns including:
- Account validation
- Signer verification
- Proper PDA handling
- Cross-program invocation (CPI) risks
- Reentrancy vulnerabilities
- Arithmetic overflow/underflow
- Proper use of Anchor if applicable
- Serialization/deserialization concerns
- Gas optimization
- Program size optimization

Format the response as structured JSON with the following fields:
{
  "securityScore": number,
  "scanDuration": string (e.g., "2.3s"),
  "linesOfCode": number,
  "issuesCount": number,
  "summary": string,
  "critical": Array<{
    "type": string,
    "location": string,
    "description": string,
    "impact": string,
    "recommendation": string,
    "codeExample": string
  }>,
  "high": Array<similar structure as critical>,
  "medium": Array<similar structure as critical>,
  "low": Array<similar structure as critical>,
  "informational": Array<similar structure as critical>,
  "optimizations": Array<{
    "type": string,
    "description": string, 
    "suggestion": string,
    "impact": string,
    "codeExample": string
  }>,
  "modificationSuggestions": string (full improved code)
}`;

      // Call LLM for analysis
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert Solana security auditor and Rust program analyst specializing in Solana blockchain development. Provide detailed, accurate code analysis with concrete, actionable feedback specific to Solana programs.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: model,
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      try {
        // Attempt to parse the JSON response
        const analysisData = JSON.parse(responseText);
        
        // Calculate scan duration
        const scanDuration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        
        return {
          ...analysisData,
          scanDuration,
          rawAnalysis: responseText
        };
      } catch (parseError) {
        console.error('Error parsing analysis response:', parseError);
        
        // Fallback structured response if parsing fails
        return {
          securityScore: 50,
          scanDuration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
          linesOfCode: code.split('\n').length,
          issuesCount: 1,
          summary: "Error generating structured analysis. Please review the raw response.",
          critical: [],
          high: [],
          medium: [],
          low: [],
          informational: [{
            type: "Parser Error",
            location: "N/A",
            description: "Failed to parse analysis results.",
            impact: "Unable to provide structured analysis",
            recommendation: "Please review the raw analysis output."
          }],
          optimizations: [],
          modificationSuggestions: undefined,
          rawAnalysis: responseText
        };
      }
    } catch (error) {
      console.error('Contract analyzer error:', error);
      
      // Provide a fallback response if analysis fails
      return {
        securityScore: 0,
        scanDuration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
        linesOfCode: code.split('\n').length,
        issuesCount: 1,
        summary: "Error analyzing Solana program. See error message below.",
        critical: [{
          type: "Analysis Error",
          location: "N/A",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          impact: "Could not analyze the Solana program",
          recommendation: "Please check your code syntax and try again."
        }],
        high: [],
        medium: [],
        low: [],
        informational: [],
        optimizations: [],
        modificationSuggestions: undefined
      };
    }
  },
  
  /**
   * Helper function to extract specific suggestions from analysis
   */
  getSuggestionsFromAnalysis(analysis: ContractAnalysis): string {
    let suggestions = "# Suggested Improvements\n\n";
    
    // Add critical issues first
    if (analysis.critical.length > 0) {
      suggestions += "## Critical Issues\n\n";
      analysis.critical.forEach(issue => {
        suggestions += `### ${issue.type}\n`;
        suggestions += `- **Location**: ${issue.location || 'Not specified'}\n`;
        suggestions += `- **Issue**: ${issue.description}\n`;
        suggestions += `- **Fix**: ${issue.recommendation}\n\n`;
        if (issue.codeExample) {
          suggestions += "```rust\n" + issue.codeExample + "\n```\n\n";
        }
      });
    }
    
    // Add high severity issues
    if (analysis.high.length > 0) {
      suggestions += "## High Severity Issues\n\n";
      analysis.high.forEach(issue => {
        suggestions += `### ${issue.type}\n`;
        suggestions += `- **Location**: ${issue.location || 'Not specified'}\n`;
        suggestions += `- **Issue**: ${issue.description}\n`;
        suggestions += `- **Fix**: ${issue.recommendation}\n\n`;
      });
    }
    
    // Add optimizations
    if (analysis.optimizations.length > 0) {
      suggestions += "## Optimizations\n\n";
      analysis.optimizations.forEach(opt => {
        suggestions += `### ${opt.type}\n`;
        suggestions += `- **Description**: ${opt.description}\n`;
        suggestions += `- **Suggestion**: ${opt.suggestion}\n`;
        suggestions += `- **Impact**: ${opt.impact}\n\n`;
        if (opt.codeExample) {
          suggestions += "```rust\n" + opt.codeExample + "\n```\n\n";
        }
      });
    }
    
    return suggestions;
  }
};