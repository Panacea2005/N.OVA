// services/contractAnalyzer.ts
import Groq from "groq-sdk";

// Replace with your actual GROQ API key or use environment variables
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "your-groq-api-key",
  dangerouslyAllowBrowser: true
});

// Enhanced issue structure with severity level and vulnerability type
interface SecurityIssue {
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  description: string;
  location?: string;
  impact: string;
  recommendation: string;
  codeExample?: string;
  vulnerabilityType?: string; // E.g., "Integer Overflow", "Reentrancy", etc.
}

interface Optimization {
  type: string;
  description: string;
  suggestion: string;
  impact: string;
  codeExample?: string;
  category?: "gas" | "security" | "maintainability"; // Categorize optimizations
}

// Enhanced analysis interface with more detailed metrics
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
  // New fields for enhanced analysis
  contractComplexity?: 'simple' | 'moderate' | 'complex';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  vulnerableFunctions?: string[];
  securityChecks?: {
    accountChecks: boolean;
    signatureVerification: boolean;
    pdaHandling: boolean;
    arithmeticChecks: boolean;
    reentrancyProtection: boolean;
  };
  codeQualityScore?: number; // 0-100
}

// Solana-specific vulnerability categories for better prompting
const SOLANA_VULNERABILITY_TYPES = [
  "Missing signer check",
  "Improper PDA validation",
  "Account data validation",
  "Incorrect CPI handling",
  "Reentrancy vulnerability",
  "Integer overflow/underflow",
  "Missing owner check",
  "Deserialization issues",
  "Mishandled cross-program invocation",
  "Missing privilege escalation protection",
  "Improper error handling",
  "Proxy contract vulnerability",
  "Flash loan vulnerability",
  "Incorrect account closing",
  "Front-running vulnerability"
];

export const contractAnalyzer = {
  async analyzeContract(code: string, model: string): Promise<ContractAnalysis> {
    const startTime = Date.now();
    try {
      console.log("Starting enhanced Solana program analysis...");
      
      // Extract possible function names for targeted analysis
      const potentialFunctions = this.extractFunctionNames(code);
      
      // Generate enhanced prompt for more detailed code analysis
      const prompt = `Analyze the following Rust code for a Solana program:

\`\`\`rust
${code}
\`\`\`

Provide a comprehensive security analysis focusing specifically on Solana security concerns and include:

1. Security score (0-100)
2. Contract complexity assessment (simple/moderate/complex)
3. Overall risk level assessment (low/medium/high/critical)
4. Detailed analysis of issues categorized by severity:
   - Critical issues: Immediately exploitable vulnerabilities that could lead to significant fund loss
   - High severity issues: Serious vulnerabilities that could be exploited with some effort
   - Medium severity issues: Vulnerabilities that could lead to problems but are not immediately exploitable
   - Low severity issues: Issues that represent poor practices but don't directly lead to vulnerabilities
   - Informational issues: Educational points that would improve security but don't represent vulnerabilities

5. Specific optimization recommendations for Solana programs (optimizing compute units)
6. Suggested code modifications that would improve security and efficiency

Focus on the following Solana-specific security concerns:
- Account validation and ownership checks
- Signer verification and authority validation
- Proper PDA derivation and handling
- Cross-program invocation (CPI) risks
- Reentrancy vulnerabilities
- Arithmetic overflow/underflow
- Proper use of Anchor patterns if applicable
- Serialization/deserialization security
- Gas/compute unit optimization
- Program size optimization
- Front-running potential
- Flash loan vulnerabilities
- Error handling and error propagation

${potentialFunctions.length > 0 ? `The program contains these potential entry points or important functions (analyze with particular attention): ${potentialFunctions.join(', ')}` : ''}

Format the response as structured JSON with the following fields:
{
  "securityScore": number (0-100),
  "scanDuration": string (e.g., "2.3s"),
  "linesOfCode": number,
  "issuesCount": number,
  "summary": string (concise 2-3 sentence summary),
  "contractComplexity": string (one of: "simple", "moderate", "complex"),
  "riskLevel": string (one of: "low", "medium", "high", "critical"),
  "vulnerableFunctions": string[] (list of function names with security concerns),
  "securityChecks": {
    "accountChecks": boolean,
    "signatureVerification": boolean, 
    "pdaHandling": boolean,
    "arithmeticChecks": boolean,
    "reentrancyProtection": boolean
  },
  "codeQualityScore": number (0-100),
  "critical": Array<{
    "type": string,
    "vulnerabilityType": string,
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
    "category": string,
    "description": string, 
    "suggestion": string,
    "impact": string,
    "codeExample": string
  }>,
  "modificationSuggestions": string (full improved code, make sure this is valid Rust code that would compile)
}

Ensure the analysis is thorough but contains properly formatted JSON. Return the modificationSuggestions only if you are confident the code will compile.`;

      // Call LLM for analysis with enhanced system prompt
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert Solana security auditor and Rust program analyst specializing in blockchain security. You have deep knowledge of the Solana programming model, including PDAs, CPIs, account validation, and Anchor patterns. Provide detailed, accurate code analysis with concrete, actionable feedback specific to Solana programs. Focus on security vulnerabilities that are specific to Solana's programming model - not just general Rust issues.
            
For critical and high issues, always provide specific code examples showing both the vulnerable code and how to fix it. Be precise about locations in the code where issues exist. Remember that Solana programs have unique security concerns compared to Ethereum smart contracts, particularly around account validation.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: model,
        response_format: { type: "json_object" },
        // Increase temperature slightly for more nuanced analysis
        temperature: 0.2,
        // Increase token limit to ensure complete analysis
        max_tokens: 4000
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      try {
        // Attempt to parse the JSON response
        const analysisData = JSON.parse(responseText);
        
        // Calculate scan duration
        const scanDuration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        
        // Post-process and validate the analysis data
        const processedAnalysis = this.postProcessAnalysis(analysisData, code);
        
        return {
          ...processedAnalysis,
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
            severity: "informational" as "informational",
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
          severity: "critical" as "critical",
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
   * Extract function names from Rust code for targeted analysis
   */
  extractFunctionNames(code: string): string[] {
    const functionMatches = code.match(/fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g) || [];
    return functionMatches.map(match => {
      const nameMatch = match.match(/fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);
  },
  
  /**
   * Post-process analysis data to ensure consistency and quality
   */
  postProcessAnalysis(analysisData: any, code: string): ContractAnalysis {
    // Ensure we have all necessary arrays even if empty
    const result: ContractAnalysis = {
      ...analysisData,
      critical: analysisData.critical || [],
      high: analysisData.high || [],
      medium: analysisData.medium || [],
      low: analysisData.low || [],
      informational: analysisData.informational || [],
      optimizations: analysisData.optimizations || [],
      linesOfCode: analysisData.linesOfCode || code.split('\n').length,
      issuesCount: 0
    };
    
    // Count total issues
    result.issuesCount = 
      result.critical.length + 
      result.high.length + 
      result.medium.length + 
      result.low.length + 
      result.informational.length;
    
    // Set a default summary if none provided
    if (!result.summary) {
      result.summary = `Analysis completed with ${result.issuesCount} issues found. Security score: ${result.securityScore}/100.`;
    }
    
    // If vulnerable functions not provided but we have high/critical issues, try to extract from those
    if (!result.vulnerableFunctions && (result.critical.length > 0 || result.high.length > 0)) {
      const locations = [
        ...result.critical.map(i => i.location || ''),
        ...result.high.map(i => i.location || '')
      ].filter(Boolean);
      
      // Extract function names from locations
      const functionPattern = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)|fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
      result.vulnerableFunctions = Array.from(
        new Set(
          locations
            .map(loc => {
              const match = loc.match(functionPattern);
              return match ? (match[1] || match[2]) : null;
            })
            .filter(Boolean) as string[]
        )
      );
    }
    
    return result;
  },
  
  /**
   * Get a shortened analysis suitable for chat display with collapsible sections
   */
  getCompactAnalysis(analysis: ContractAnalysis): string {
    const criticalCount = analysis.critical.length;
    const highCount = analysis.high.length;
    const mediumCount = analysis.medium.length;
    const lowCount = analysis.low.length;
    const infoCount = analysis.informational.length;
    const optCount = analysis.optimizations.length;
    
    let result = `# Solana Program Analysis\n\n`;
    
    // Add summary section
    result += `## Overview\n`;
    result += `- **Security Score**: ${analysis.securityScore}/100\n`;
    result += `- **Scan Duration**: ${analysis.scanDuration}\n`;
    result += `- **Lines of Code**: ${analysis.linesOfCode}\n`;
    result += `- **Risk Level**: ${analysis.riskLevel || 'Not specified'}\n`;
    result += `- **Complexity**: ${analysis.contractComplexity || 'Not specified'}\n`;
    
    // Add summary text
    if (analysis.summary) {
      result += `\n**Summary**: ${analysis.summary}\n\n`;
    }
    
    // Only include sections that have issues
    if (criticalCount > 0) {
      result += `## Critical Issues (${criticalCount})\n\n`;
      analysis.critical.slice(0, 2).forEach((issue, idx) => {
        result += `### ${idx+1}. ${issue.type}\n`;
        result += `- **Location**: ${issue.location || 'Not specified'}\n`;
        result += `- **Description**: ${issue.description}\n`;
        result += `- **Impact**: ${issue.impact}\n`;
        result += `- **Fix**: ${issue.recommendation}\n\n`;
      });
      
      if (criticalCount > 2) {
        result += `*${criticalCount-2} more critical issues omitted for brevity*\n\n`;
      }
    }
    
    if (highCount > 0) {
      result += `## High Severity Issues (${highCount})\n\n`;
      analysis.high.slice(0, 2).forEach((issue, idx) => {
        result += `### ${idx+1}. ${issue.type}\n`;
        result += `- **Location**: ${issue.location || 'Not specified'}\n`;
        result += `- **Description**: ${issue.description}\n`;
        result += `- **Fix**: ${issue.recommendation}\n\n`;
      });
      
      if (highCount > 2) {
        result += `*${highCount-2} more high severity issues omitted for brevity*\n\n`;
      }
    }
    
    // Just show counts for medium/low issues
    if (mediumCount > 0 || lowCount > 0) {
      result += `## Other Issues\n`;
      if (mediumCount > 0) result += `- **Medium Severity**: ${mediumCount} issues\n`;
      if (lowCount > 0) result += `- **Low Severity**: ${lowCount} issues\n`;
      result += `\n`;
    }
    
    // Show optimization summary
    if (optCount > 0) {
      result += `## Optimization Suggestions (${optCount})\n\n`;
      analysis.optimizations.slice(0, 2).forEach((opt, idx) => {
        result += `### ${idx+1}. ${opt.type}\n`;
        result += `- **Description**: ${opt.description}\n`;
        result += `- **Suggestion**: ${opt.suggestion}\n\n`;
      });
      
      if (optCount > 2) {
        result += `*${optCount-2} more optimization suggestions omitted for brevity*\n\n`;
      }
    }
    
    return result;
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