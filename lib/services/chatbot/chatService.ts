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
        
        // Return a compact version of the analysis for chat display
        // The full analysis data will be available in the analysisResult property
        return contractAnalyzer.getCompactAnalysis(analysis);
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

  // Format the analysis result for display in the chat
  formatAnalysisResult(analysis: any): string {
    // Return just the compact version for chat display
    return contractAnalyzer.getCompactAnalysis(analysis);
  },
  
  // Detection of Solana code has been enhanced to be more accurate
  // and detect more Solana-specific patterns
  detectSolanaCode(content: string): boolean {
    // Check for Rust-specific keywords
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
    
    // Check for Solana-specific imports and types
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
    
    // Check for Anchor-specific macros and attributes
    const anchorPatterns = [
      '#[program]',
      '#[account]',
      '#[derive(Accounts)]',
      '#[instruction(',
      '@program_id',
      'declare_id!',
      'account(',
      'init(',
      'space =',
      'seeds ='
    ];
    
    // Special patterns to check separately
    const hasAttributes = content.includes('#[');
    
    // Check for Rust syntax
    const hasRustSyntax = rustKeywords.some(keyword => content.includes(keyword));
    
    // Check for Solana-specific code
    const hasSolanaSyntax = solanaKeywords.some(keyword => content.includes(keyword));
    
    // Check for Anchor patterns
    const hasAnchorPatterns = anchorPatterns.some(pattern => content.includes(pattern));
    
    // Also check for uploaded Rust files
    const isRustFile = content.includes("File: ") && 
      (content.toLowerCase().includes(".rs") || content.toLowerCase().includes("rust") || 
       content.toLowerCase().includes("solana"));
    
    // Check if the content is long enough to potentially be code
    const isLongEnough = content.split('\n').length > 5;
    
    // Return true if any of the checks pass
    return (isLongEnough && (hasRustSyntax || hasSolanaSyntax || hasAttributes || hasAnchorPatterns)) || isRustFile;
  }
};