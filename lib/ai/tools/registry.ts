import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AgentConfig } from '../types';

export type ToolExecutionContext = {
  supabase: SupabaseClient;
  agent: AgentConfig;
};

export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  parameters: z.ZodType<TParams>;
  execute: (params: TParams, context: ToolExecutionContext) => Promise<TResult>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getOpenAIToolsFormat(): any[] {
    return this.getAllTools().map((tool) => {
      // Very basic Zod to JSON Schema conversion for OpenAI
      // For production, consider using zod-to-json-schema package
      // Here we will implement a lightweight manual mapping or just use a generic object if not using a library.
      return {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: this.zodToJsonSchema(tool.parameters),
        },
      };
    });
  }

  async executeTool(name: string, argsString: string, context: ToolExecutionContext): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    try {
      const parsedArgs = JSON.parse(argsString);
      // Validate with Zod
      const validatedArgs = tool.parameters.parse(parsedArgs);
      
      // Execute
      return await tool.execute(validatedArgs, context);
    } catch (error: any) {
      console.error(`Error executing tool ${name}:`, error);
      return {
        error: `Tool execution failed: ${error.message || 'Unknown error'}`,
      };
    }
  }

  private zodToJsonSchema(schema: z.ZodType<any>): any {
    // This is a simplified Zod to JSON schema converter.
    // In a full production system you would use zod-to-json-schema
    const typeDef = (schema as any)._def;
    const typeName = typeDef.typeName;

    if (typeName === 'ZodObject') {
      const shape = typeDef.shape();
      const properties: any = {};
      const required: string[] = [];

      for (const [key, propSchema] of Object.entries(shape)) {
        properties[key] = this.zodToJsonSchema(propSchema as z.ZodType<any>);
        if (!(propSchema as any).isOptional()) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required,
        additionalProperties: false,
      };
    }

    if (typeName === 'ZodString') {
      return { type: 'string' };
    }

    if (typeName === 'ZodNumber') {
      return { type: 'number' };
    }

    if (typeName === 'ZodBoolean') {
      return { type: 'boolean' };
    }

    if (typeName === 'ZodArray') {
      return {
        type: 'array',
        items: this.zodToJsonSchema(typeDef.type),
      };
    }

    // Default fallback
    return { type: 'string' };
  }
}

export const globalToolRegistry = new ToolRegistry();
