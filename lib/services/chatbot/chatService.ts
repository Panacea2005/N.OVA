// services/chatService.ts
import Groq from "groq-sdk";
import { contractAnalyzer } from "./contractAnalyzer";

// Replace with your actual GROQ API key or use environment variables
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "your-groq-api-key",
  dangerouslyAllowBrowser: true
});

export interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp?: Date;
  analysisResult?: any;
}

export const chatService = {
  async sendMessage(messages: Message[], model: string): Promise<string> {
    try {
      if (!messages.length) throw new Error("Messages array is empty.");

      const userMessage = messages[messages.length - 1];
      if (!userMessage || userMessage.role !== 'user') {
        throw new Error("No valid user message found.");
      }

      console.log('Sending message to Groq:', userMessage.content);

      // Check if the message contains Rust/Solana code
      if (this.detectSolanaCode(userMessage.content)) {
        const analysis = await contractAnalyzer.analyzeContract(userMessage.content, model);
        // For code analysis we return a formatted string
        return analysis.rawAnalysis || this.formatDefaultAnalysis(analysis);
      }

      // For regular chat messages
      const systemMessage = {
        role: "system" as const,
        content: `You are NOVA, an advanced AI assistant from O.XYZ. You're helpful, innovative, and provide clear, concise answers. Your tone is modern, professional but conversational. You specialize in Solana blockchain development, Rust programming, and blockchain technology in general. Provide detailed and accurate explanations when asked about these topics.`
      };

      const completion = await groq.chat.completions.create({
        messages: [
          systemMessage,
          ...messages.slice(-5).map(msg => ({
            role: msg.role as "system" | "user" | "assistant",
            content: msg.content
          }))
        ],
        model: model,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error('Chat service error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },

  formatDefaultAnalysis(analysis: any): string {
    return `# Solana Program Analysis Results

## Overview
- Security Score: ${analysis.securityScore}/100
- Scan Duration: ${analysis.scanDuration}
- Lines of Code: ${analysis.linesOfCode}
- Total Issues: ${analysis.issuesCount}

${analysis.summary ? `## Summary\n${analysis.summary}\n\n` : ''}

${analysis.critical.length > 0 ? `## Critical Issues\n${this.formatIssues(analysis.critical)}\n\n` : ''}
${analysis.high.length > 0 ? `## High Severity Issues\n${this.formatIssues(analysis.high)}\n\n` : ''}
${analysis.medium.length > 0 ? `## Medium Severity Issues\n${this.formatIssues(analysis.medium)}\n\n` : ''}
${analysis.low.length > 0 ? `## Low Severity Issues\n${this.formatIssues(analysis.low)}\n\n` : ''}
${analysis.informational.length > 0 ? `## Informational Issues\n${this.formatIssues(analysis.informational)}\n\n` : ''}
${analysis.optimizations.length > 0 ? `## Optimization Suggestions\n${this.formatOptimizations(analysis.optimizations)}\n\n` : ''}

${analysis.modificationSuggestions ? `## Recommended Modifications\n\`\`\`rust\n${analysis.modificationSuggestions}\n\`\`\`\n` : ''}`;
  },

  formatIssues(issues: any[]): string {
    return issues.map(issue =>
      `### ${issue.type}\n` +
      `- **Location**: ${issue.location}\n` +
      `- **Description**: ${issue.description}\n` +
      `- **Impact**: ${issue.impact}\n` +
      `- **Recommendation**: ${issue.recommendation}\n` +
      (issue.codeExample ? `- **Example Fix**:\n\`\`\`rust\n${issue.codeExample}\n\`\`\`\n` : '')
    ).join('\n');
  },

  formatOptimizations(optimizations: any[]): string {
    return optimizations.map(opt =>
      `### ${opt.type}\n` +
      `- **Description**: ${opt.description}\n` +
      `- **Suggestion**: ${opt.suggestion}\n` +
      `- **Impact**: ${opt.impact}\n` +
      (opt.codeExample ? `- **Example**:\n\`\`\`rust\n${opt.codeExample}\n\`\`\`\n` : '')
    ).join('\n');
  },

  // Function to detect Rust/Solana code
  detectSolanaCode(content: string): boolean {
    // Check for Rust-specific keywords and Solana imports
    const rustKeywords = [
      'fn ', 
      'struct ',
      'impl ',
      'enum ',
      'pub ',
      'use ',
      'mod ',
      'let ',
      'mut ',
      'match ',
      'trait '
    ];
    
    const solanaKeywords = [
      'solana_program',
      'anchor_lang',
      'Pubkey',
      'AccountInfo',
      'Program',
      'Account',
      'invoke',
      'invoke_signed',
      'system_instruction',
      'spl_token',
      'entrypoint'
    ];
    
    // Special patterns to check separately
    const hasAttributes = content.includes('#[');
    
    // Check for Rust syntax
    const hasRustSyntax = rustKeywords.some(keyword => content.includes(keyword));
    
    // Check for Solana-specific code
    const hasSolanaSyntax = solanaKeywords.some(keyword => content.includes(keyword));
    
    // Also check for uploaded Rust files
    const isRustFile = content.includes("File: ") && content.toLowerCase().endsWith(".rs");
    
    return hasRustSyntax || hasSolanaSyntax || hasAttributes || isRustFile;
  }
};