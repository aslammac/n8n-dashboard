import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { WorkflowAnalysis } from './types';

@Injectable()
export class WorkflowAiService {
  private readonly logger = new Logger(WorkflowAiService.name);
  private ai: GoogleGenAI;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.geminiApiKey');
    const model = this.configService.get<string>('app.geminiModel');  
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.model = model || 'gemini-2.0-flash';
    } else {
      this.logger.warn('GEMINI_API_KEY not found. AI analysis will be disabled.');
    }
  }

  async analyzeWorkflow(workflowJson: string, filename?: string): Promise<WorkflowAnalysis> {
    if (!this.ai) {
      throw new Error('AI service is not configured.');
    }

    const ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert n8n automation consultant and technical writer. Your task is to analyze n8n workflow JSON files and generate comprehensive, user-friendly descriptions.

ANALYSIS GUIDELINES:

1. NODE IDENTIFICATION:
   - Extract all node types from the JSON
   - Identify the trigger node (usually first node)
   - Understand the flow of data between nodes
   - Recognize API integrations and services used

2. WORKFLOW LOGIC:
   - Determine what data is being processed
   - Identify transformations and operations
   - Understand conditional logic and branches
   - Note any loops or iterations

3. DESCRIPTION WRITING:
   - Use clear, non-technical language
   - Focus on benefits and outcomes
   - Explain the business value
   - Make it beginner-friendly
   - Highlight automation savings

4. CATEGORIZATION:
   - Choose the most relevant category
   - Assign appropriate complexity level
   - Add 5-10 relevant tags
   - List all technical requirements

5. CONTEXT & ACCURACY:
   - If a filename is provided, use it to strongly infer the workflow's intent, especially if the JSON structure is ambiguous or generic. 
   - The filename often contains keywords about the integrated services or the problem being solved (e.g., "slack-notification.json").
   - Do not hallucinate nodes or integrations that are not present in the JSON code.
`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Clear, descriptive workflow name (max 60 characters)" },
        shortDescription: { type: Type.STRING, description: "One-sentence summary (max 160 characters)" },
        detailedDescription: { type: Type.STRING, description: "2-3 paragraphs explaining what the workflow does, how it works" },
        useCase: { type: Type.STRING, description: "Primary use case or problem this solves" },
        category: {
          type: Type.STRING,
          enum: [
            "AI & ML",
            "Marketing",
            "Sales",
            "Data Processing",
            "Productivity",
            "Integration",
            "Communication",
            "E-commerce",
            "Finance",
            "HR",
            "Other"
          ]
        },
        complexity: {
          type: Type.STRING,
          enum: ["beginner", "intermediate", "advanced"]
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Array of relevant keywords"
        },
        nodes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of node types used"
        },
        requirements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of prerequisites or API keys needed"
        },
        setupSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3-7 key setup steps"
        },
        benefits: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3-5 key benefits"
        },
        setupTime: { type: Type.STRING, description: "Estimated setup time (e.g., '5 minutes')" },
        triggerType: { type: Type.STRING, description: "What triggers this workflow" }
      },
      required: [
        "title",
        "shortDescription",
        "detailedDescription",
        "useCase",
        "category",
        "complexity",
        "tags",
        "nodes",
        "requirements",
        "setupSteps",
        "benefits",
        "setupTime",
        "triggerType"
      ]
    };

    try {
      const parts = [];
      parts.push({ text: "Analyze the following n8n workflow JSON and provide the structured documentation." });
      
      if (filename) {
        parts.push({ text: `\nFilename: ${filename}\n(Use this filename to help understand the context of the workflow)` });
      }
      
      parts.push({ text: `\nJSON Content:\n${workflowJson}` });

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
          {
            role: "user",
            parts: parts
          }
        ],
        config: {
          systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.2,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response generated from AI model.");
      }

      const data = JSON.parse(text) as WorkflowAnalysis;
      return data;

    } catch (error) {
      this.logger.error("Gemini Analysis Error:", error);
      throw new Error("Failed to analyze workflow. Please ensure the JSON is valid and try again.");
    }
  }
}
