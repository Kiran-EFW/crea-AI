import { db } from "@/db";
import {
  language_model_providers as languageModelProvidersSchema,
  language_models as languageModelsSchema,
} from "@/db/schema";
import type { LanguageModelProvider, LanguageModel } from "@/ipc/ipc_types";
import { eq } from "drizzle-orm";

export const PROVIDERS_THAT_SUPPORT_THINKING: (keyof typeof MODEL_OPTIONS)[] = [
  "google",
  "auto",
];

export interface ModelOption {
  name: string;
  displayName: string;
  description: string;
  temperature?: number;
  tag?: string;
  maxOutputTokens?: number;
  contextWindow?: number;
}

export const MODEL_OPTIONS: Record<string, ModelOption[]> = {
  openai: [
    // https://platform.openai.com/docs/models/gpt-5
    {
      name: "gpt-5",
      displayName: "GPT 5",
      description: "OpenAI's flagship model",
      // Technically it's 128k but OpenAI errors if you set max_tokens instead of max_completion_tokens
      maxOutputTokens: undefined,
      contextWindow: 400_000,
      // Requires temperature to be default value (1)
      temperature: 1,
    },
    // https://platform.openai.com/docs/models/gpt-5-mini
    {
      name: "gpt-5-mini",
      displayName: "GPT 5 Mini",
      description: "OpenAI's lightweight, but intelligent model",
      // Technically it's 128k but OpenAI errors if you set max_tokens instead of max_completion_tokens
      maxOutputTokens: undefined,
      contextWindow: 400_000,
      // Requires temperature to be default value (1)
      temperature: 1,
    },
    // https://platform.openai.com/docs/models/gpt-5-nano
    {
      name: "gpt-5-nano",
      displayName: "GPT 5 Nano",
      description: "Fastest, most cost-efficient version of GPT-5",
      // Technically it's 128k but OpenAI errors if you set max_tokens instead of max_completion_tokens
      maxOutputTokens: undefined,
      contextWindow: 400_000,
      // Requires temperature to be default value (1)
      temperature: 1,
    },
    // https://platform.openai.com/docs/models/gpt-4.1
    {
      name: "gpt-4.1",
      displayName: "GPT 4.1",
      description: "OpenAI's flagship model",
      maxOutputTokens: 32_768,
      contextWindow: 1_047_576,
      temperature: 0,
    },
    // https://platform.openai.com/docs/models/gpt-4.1-mini
    {
      name: "gpt-4.1-mini",
      displayName: "GPT 4.1 Mini",
      description: "OpenAI's lightweight, but intelligent model",
      maxOutputTokens: 32_768,
      contextWindow: 1_047_576,
      temperature: 0,
    },
    // https://platform.openai.com/docs/models/o3-mini
    {
      name: "o3-mini",
      displayName: "o3 mini",
      description: "Reasoning model",
      // See o4-mini comment below for why we set this to 32k
      maxOutputTokens: 32_000,
      contextWindow: 200_000,
      temperature: 0,
    },
    // https://platform.openai.com/docs/models/o4-mini
    {
      name: "o4-mini",
      displayName: "o4 mini",
      description: "Reasoning model",
      // Technically the max output tokens is 100k, *however* if the user has a lot of input tokens,
      // then setting a high max output token will cause the request to fail because
      // the max output tokens is *included* in the context window limit.
      maxOutputTokens: 32_000,
      contextWindow: 200_000,
      temperature: 0,
    },
  ],
  // https://docs.anthropic.com/en/docs/about-claude/models/all-models#model-comparison-table
  anthropic: [
    {
      name: "claude-sonnet-4-20250514",
      displayName: "Claude 4 Sonnet",
      description: "Excellent coder",
      // See comment below for Claude 3.7 Sonnet for why we set this to 16k
      maxOutputTokens: 16_000,
      contextWindow: 200_000,
      temperature: 0,
    },
    {
      name: "claude-3-7-sonnet-latest",
      displayName: "Claude 3.7 Sonnet",
      description: "Excellent coder",
      // Technically the max output tokens is 64k, *however* if the user has a lot of input tokens,
      // then setting a high max output token will cause the request to fail because
      // the max output tokens is *included* in the context window limit, see:
      // https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#max-tokens-and-context-window-size-with-extended-thinking
      maxOutputTokens: 16_000,
      contextWindow: 200_000,
      temperature: 0,
    },
    {
      name: "claude-3-5-sonnet-20241022",
      displayName: "Claude 3.5 Sonnet",
      description: "Good coder, excellent at following instructions",
      maxOutputTokens: 8_000,
      contextWindow: 200_000,
      temperature: 0,
    },
    {
      name: "claude-3-5-haiku-20241022",
      displayName: "Claude 3.5 Haiku",
      description: "Lightweight coder",
      maxOutputTokens: 8_000,
      contextWindow: 200_000,
      temperature: 0,
    },
  ],
  google: [
    // https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro-preview-03-25
    {
      name: "gemini-2.5-pro",
      displayName: "Gemini 2.5 Pro",
      description: "Google's Gemini 2.5 Pro model",
      // See Flash 2.5 comment below (go 1 below just to be safe, even though it seems OK now).
      maxOutputTokens: 65_536 - 1,
      // Gemini context window = input token + output token
      contextWindow: 1_048_576,
      temperature: 0,
    },
    // https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-preview
    {
      name: "gemini-2.5-flash",
      displayName: "Gemini 2.5 Flash",
      description: "Google's Gemini 2.5 Flash model (free tier available)",
      // Weirdly for Vertex AI, the output token limit is *exclusive* of the stated limit.
      maxOutputTokens: 65_536 - 1,
      // Gemini context window = input token + output token
      contextWindow: 1_048_576,
      temperature: 0,
    },
  ],
  openrouter: [
    // Claude Models via OpenRouter
    {
      name: "anthropic/claude-3.7-sonnet",
      displayName: "Claude 3.7 Sonnet (OpenRouter)",
      description: "Anthropic's latest model via OpenRouter",
      maxOutputTokens: 32_000,
      contextWindow: 200_000,
      temperature: 0,
    },
    {
      name: "anthropic/claude-3.5-sonnet",
      displayName: "Claude 3.5 Sonnet (OpenRouter)",
      description: "Powerful coding model via OpenRouter",
      maxOutputTokens: 32_000,
      contextWindow: 200_000,
      temperature: 0,
    },
    // GPT Models via OpenRouter
    {
      name: "openai/gpt-5",
      displayName: "GPT-5 (OpenRouter)",
      description: "OpenAI's latest model via OpenRouter",
      maxOutputTokens: 32_000,
      contextWindow: 400_000,
      temperature: 0,
    },
    {
      name: "openai/gpt-5-mini",
      displayName: "GPT-5 Mini (OpenRouter)",
      description: "Fast and efficient GPT-5 via OpenRouter",
      maxOutputTokens: 32_000,
      contextWindow: 400_000,
      temperature: 0,
    },
    // Gemini Models via OpenRouter
    {
      name: "google/gemini-2.5-pro",
      displayName: "Gemini 2.5 Pro (OpenRouter)",
      description: "Google's advanced model via OpenRouter",
      maxOutputTokens: 32_000,
      contextWindow: 1_000_000,
      temperature: 0,
    },
    {
      name: "google/gemini-2.5-flash",
      displayName: "Gemini 2.5 Flash (OpenRouter)",
      description: "Fast Gemini model via OpenRouter",
      maxOutputTokens: 32_000,
      contextWindow: 1_000_000,
      temperature: 0,
    },
    // Coding-focused models
    {
      name: "qwen/qwen3-coder",
      displayName: "Qwen3 Coder",
      description: "Qwen's best coding model",
      maxOutputTokens: 32_000,
      contextWindow: 262_000,
      temperature: 0,
    },
    {
      name: "codestral/codestral-mamba",
      displayName: "Codestral Mamba",
      description: "Mistral's advanced coding model",
      maxOutputTokens: 32_000,
      contextWindow: 256_000,
      temperature: 0,
    },
    // Reasoning models
    {
      name: "deepseek/deepseek-r1-0528",
      displayName: "DeepSeek R1",
      description: "Excellent reasoning model with great price/performance",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "deepseek/deepseek-v3",
      displayName: "DeepSeek v3",
      description: "Powerful reasoning model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    // Cost-effective options
    {
      name: "moonshotai/kimi-k2",
      displayName: "Kimi K2",
      description: "Powerful cost-effective model",
      maxOutputTokens: 32_000,
      contextWindow: 131_000,
      temperature: 0,
    },
    // Free tier options
    {
      name: "deepseek/deepseek-chat-v3-0324:free",
      displayName: "DeepSeek v3 (free)",
      description: "Use for free (data may be used for training)",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "microsoft/wizardlm-2-8x22b",
      displayName: "WizardLM 2 (free)",
      description: "Free tier reasoning model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
  ],
  auto: [
    {
      name: "auto",
      displayName: "Auto",
      description: "Automatically selects the best model",
      tag: "Default",
      // These are below Gemini 2.5 Pro & Flash limits
      // which are the ones defaulted to for both regular auto
      // and smart auto.
      maxOutputTokens: 32_000,
      contextWindow: 1_000_000,
      temperature: 0,
    },
  ],
  azure: [
    {
      name: "gpt-5",
      displayName: "GPT-5",
      description: "Azure OpenAI GPT-5 model with reasoning capabilities",
      maxOutputTokens: 128_000,
      contextWindow: 400_000,
      temperature: 0,
    },
    {
      name: "gpt-5-mini",
      displayName: "GPT-5 Mini",
      description: "Azure OpenAI GPT-5 Mini model",
      maxOutputTokens: 128_000,
      contextWindow: 400_000,
      temperature: 0,
    },
    {
      name: "gpt-5-nano",
      displayName: "GPT-5 Nano",
      description: "Azure OpenAI GPT-5 Nano model",
      maxOutputTokens: 128_000,
      contextWindow: 400_000,
      temperature: 0,
    },
    {
      name: "gpt-5-chat",
      displayName: "GPT-5 Chat",
      description: "Azure OpenAI GPT-5 Chat model",
      maxOutputTokens: 16_384,
      contextWindow: 128_000,
      temperature: 0,
    },
  ],
  grok: [
    {
      name: "grok-2-1212",
      displayName: "Grok 2",
      description: "xAI's Grok 2 model with enhanced reasoning",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "grok-2-mini",
      displayName: "Grok 2 Mini",
      description: "Fast and efficient Grok model",
      maxOutputTokens: 16_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "grok-beta",
      displayName: "Grok Beta",
      description: "Latest Grok beta with experimental features",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "grok-1",
      displayName: "Grok 1",
      description: "Original Grok model with reliable performance",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "grok-2-fast",
      displayName: "Grok 2 Fast",
      description: "Optimized Grok 2 for speed and efficiency",
      maxOutputTokens: 16_000,
      contextWindow: 128_000,
      temperature: 0,
    },
  ],
  mistral: [
    {
      name: "mistral-large-latest",
      displayName: "Mistral Large",
      description: "Mistral's most powerful model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "mistral-medium",
      displayName: "Mistral Medium",
      description: "Balanced performance and efficiency",
      maxOutputTokens: 32_000,
      contextWindow: 32_000,
      temperature: 0,
    },
    {
      name: "codestral-mamba",
      displayName: "Codestral Mamba",
      description: "Mistral's coding-focused model",
      maxOutputTokens: 32_000,
      contextWindow: 256_000,
      temperature: 0,
    },
  ],
  cohere: [
    {
      name: "command-r-plus",
      displayName: "Command R+",
      description: "Cohere's most powerful model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "command-r",
      displayName: "Command R",
      description: "Cohere's advanced reasoning model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
  ],
  together: [
    {
      name: "meta-llama/llama-3.3-70b-instruct-turbo",
      displayName: "Llama 3.3 70B",
      description: "Meta's largest Llama model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "meta-llama/llama-3.1-8b-instruct-turbo",
      displayName: "Llama 3.1 8B",
      description: "Fast and efficient Llama model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
  ],
  perplexity: [
    {
      name: "llama-3.1-sonar-large-128k-online",
      displayName: "Sonar Large Online",
      description: "Real-time web search with Llama 3.1",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
    {
      name: "llama-3.1-sonar-small-128k-online",
      displayName: "Sonar Small Online",
      description: "Fast online search model",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
    },
  ],
};

export const PROVIDER_TO_ENV_VAR: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GEMINI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  azure: "AZURE_API_KEY",
  grok: "GROK_API_KEY",
  mistral: "MISTRAL_API_KEY",
  cohere: "COHERE_API_KEY",
  together: "TOGETHER_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
};

export const CLOUD_PROVIDERS: Record<
  string,
  {
    displayName: string;
    hasFreeTier?: boolean;
    websiteUrl?: string;
    gatewayPrefix: string;
  }
> = {
  openai: {
    displayName: "OpenAI",
    hasFreeTier: false,
    websiteUrl: "https://platform.openai.com/api-keys",
    gatewayPrefix: "",
  },
  anthropic: {
    displayName: "Anthropic",
    hasFreeTier: false,
    websiteUrl: "https://console.anthropic.com/settings/keys",
    gatewayPrefix: "anthropic/",
  },
  google: {
    displayName: "Google",
    hasFreeTier: true,
    websiteUrl: "https://aistudio.google.com/app/apikey",
    gatewayPrefix: "gemini/",
  },
  openrouter: {
    displayName: "OpenRouter",
    hasFreeTier: true,
    websiteUrl: "https://openrouter.ai/settings/keys",
    gatewayPrefix: "openrouter/",
  },
  auto: {
    displayName: "Scalix",
    websiteUrl: "https://academy.scalix.world/settings",
    gatewayPrefix: "scalix/",
  },
  azure: {
    displayName: "Azure OpenAI",
    hasFreeTier: false,
    websiteUrl: "https://portal.azure.com/",
    gatewayPrefix: "",
  },
  grok: {
    displayName: "Grok",
    hasFreeTier: false,
    websiteUrl: "https://console.x.ai/",
    gatewayPrefix: "grok/",
  },
  mistral: {
    displayName: "Mistral AI",
    hasFreeTier: false,
    websiteUrl: "https://console.mistral.ai/",
    gatewayPrefix: "mistral/",
  },
  cohere: {
    displayName: "Cohere",
    hasFreeTier: false,
    websiteUrl: "https://dashboard.cohere.ai/",
    gatewayPrefix: "cohere/",
  },
  together: {
    displayName: "Together AI",
    hasFreeTier: false,
    websiteUrl: "https://api.together.xyz/",
    gatewayPrefix: "together/",
  },
  perplexity: {
    displayName: "Perplexity",
    hasFreeTier: true,
    websiteUrl: "https://www.perplexity.ai/",
    gatewayPrefix: "perplexity/",
  },
};

const LOCAL_PROVIDERS: Record<
  string,
  {
    displayName: string;
    hasFreeTier: boolean;
  }
> = {
  ollama: {
    displayName: "Ollama",
    hasFreeTier: true,
  },
  lmstudio: {
    displayName: "LM Studio",
    hasFreeTier: true,
  },
};

/**
 * Fetches language model providers from both the database (custom) and hardcoded constants (cloud),
 * merging them with custom providers taking precedence.
 * @returns A promise that resolves to an array of LanguageModelProvider objects.
 */
export async function getLanguageModelProviders(): Promise<
  LanguageModelProvider[]
> {
  // Fetch custom providers from the database
  const customProvidersDb = await db
    .select()
    .from(languageModelProvidersSchema);

  const customProvidersMap = new Map<string, LanguageModelProvider>();
  for (const cp of customProvidersDb) {
    customProvidersMap.set(cp.id, {
      id: cp.id,
      name: cp.name,
      apiBaseUrl: cp.api_base_url,
      envVarName: cp.env_var_name ?? undefined,
      type: "custom",
      // hasFreeTier, websiteUrl, gatewayPrefix are not in the custom DB schema
      // They will be undefined unless overridden by hardcoded values if IDs match
    });
  }

  // Get hardcoded cloud providers
  const hardcodedProviders: LanguageModelProvider[] = [];
  for (const providerKey in CLOUD_PROVIDERS) {
    if (Object.prototype.hasOwnProperty.call(CLOUD_PROVIDERS, providerKey)) {
      // Ensure providerKey is a key of PROVIDERS
      const key = providerKey as keyof typeof CLOUD_PROVIDERS;
      const providerDetails = CLOUD_PROVIDERS[key];
      if (providerDetails) {
        // Ensure providerDetails is not undefined
        hardcodedProviders.push({
          id: key,
          name: providerDetails.displayName,
          hasFreeTier: providerDetails.hasFreeTier,
          websiteUrl: providerDetails.websiteUrl,
          gatewayPrefix: providerDetails.gatewayPrefix,
          envVarName: PROVIDER_TO_ENV_VAR[key] ?? undefined,
          type: "cloud",
          // apiBaseUrl is not directly in PROVIDERS
        });
      }
    }
  }

  for (const providerKey in LOCAL_PROVIDERS) {
    if (Object.prototype.hasOwnProperty.call(LOCAL_PROVIDERS, providerKey)) {
      const key = providerKey as keyof typeof LOCAL_PROVIDERS;
      const providerDetails = LOCAL_PROVIDERS[key];
      hardcodedProviders.push({
        id: key,
        name: providerDetails.displayName,
        hasFreeTier: providerDetails.hasFreeTier,
        type: "local",
      });
    }
  }

  return [...hardcodedProviders, ...customProvidersMap.values()];
}

/**
 * Fetches language models for a specific provider.
 * @param obj An object containing the providerId.
 * @returns A promise that resolves to an array of LanguageModel objects.
 */
export async function getLanguageModels({
  providerId,
}: {
  providerId: string;
}): Promise<LanguageModel[]> {
  const allProviders = await getLanguageModelProviders();
  const provider = allProviders.find((p) => p.id === providerId);

  if (!provider) {
    console.warn(`Provider with ID "${providerId}" not found.`);
    return [];
  }

  // Get custom models from DB for all provider types
  let customModels: LanguageModel[] = [];

  try {
    const customModelsDb = await db
      .select({
        id: languageModelsSchema.id,
        displayName: languageModelsSchema.displayName,
        apiName: languageModelsSchema.apiName,
        description: languageModelsSchema.description,
        maxOutputTokens: languageModelsSchema.max_output_tokens,
        contextWindow: languageModelsSchema.context_window,
      })
      .from(languageModelsSchema)
      .where(
        isCustomProvider({ providerId })
          ? eq(languageModelsSchema.customProviderId, providerId)
          : eq(languageModelsSchema.builtinProviderId, providerId),
      );

    customModels = customModelsDb.map((model) => ({
      ...model,
      description: model.description ?? "",
      tag: undefined,
      maxOutputTokens: model.maxOutputTokens ?? undefined,
      contextWindow: model.contextWindow ?? undefined,
      type: "custom",
    }));
  } catch (error) {
    console.error(
      `Error fetching custom models for provider "${providerId}" from DB:`,
      error,
    );
    // Continue with empty custom models array
  }

  // If it's a cloud provider, also get the hardcoded models
  let hardcodedModels: LanguageModel[] = [];
  if (provider.type === "cloud") {
    if (providerId in MODEL_OPTIONS) {
      const models = MODEL_OPTIONS[providerId] || [];
      hardcodedModels = models.map((model) => ({
        ...model,
        apiName: model.name,
        type: "cloud",
      }));
    } else {
      console.warn(
        `Provider "${providerId}" is cloud type but not found in MODEL_OPTIONS.`,
      );
    }
  }

  return [...hardcodedModels, ...customModels];
}

/**
 * Fetches all language models grouped by their provider IDs.
 * @returns A promise that resolves to a Record mapping provider IDs to arrays of LanguageModel objects.
 */
export async function getLanguageModelsByProviders(): Promise<
  Record<string, LanguageModel[]>
> {
  const providers = await getLanguageModelProviders();

  // Fetch all models concurrently
  const modelPromises = providers
    .filter((p) => p.type !== "local")
    .map(async (provider) => {
      const models = await getLanguageModels({ providerId: provider.id });
      return { providerId: provider.id, models };
    });

  // Wait for all requests to complete
  const results = await Promise.all(modelPromises);

  // Convert the array of results to a record
  const record: Record<string, LanguageModel[]> = {};
  for (const result of results) {
    record[result.providerId] = result.models;
  }

  return record;
}

export function isCustomProvider({ providerId }: { providerId: string }) {
  return providerId.startsWith(CUSTOM_PROVIDER_PREFIX);
}

export const CUSTOM_PROVIDER_PREFIX = "custom::";

