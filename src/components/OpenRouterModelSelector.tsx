import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Zap, Code, Brain, DollarSign } from "lucide-react";

interface OpenRouterModelSelectorProps {
  providerId: string;
}

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  supports_function_calling: boolean;
  supports_vision: boolean;
}

export function OpenRouterModelSelector({ providerId }: OpenRouterModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [customModel, setCustomModel] = useState<string>("");

  // Fetch available models from OpenRouter
  const { data: models, isLoading, error } = useQuery({
    queryKey: ["openrouter-models"],
    queryFn: async () => {
      try {
        // This would typically call OpenRouter's API to get available models
        // For now, we'll return the models we have configured
        const response = await IpcClient.getInstance().getLanguageModelsByProviders();
        return response.openrouter || [];
      } catch (error) {
        console.error("Failed to fetch OpenRouter models:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get current selected model from settings
  useEffect(() => {
    const loadCurrentModel = async () => {
      try {
        // This would load the currently selected model for the provider
        // For now, we'll just set a default
        if (models && models.length > 0) {
          setSelectedModel(models[0].apiName);
        }
      } catch (error) {
        console.error("Failed to load current model:", error);
      }
    };

    if (!isLoading) {
      loadCurrentModel();
    }
  }, [models, isLoading]);

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    try {
      // Save the selected model to settings
      // This would typically update the provider settings
      console.log("Selected model:", modelId);
    } catch (error) {
      console.error("Failed to save model selection:", error);
    }
  };

  const getModelCategory = (modelName: string) => {
    if (modelName.includes("claude") || modelName.includes("sonnet")) return "anthropic";
    if (modelName.includes("gpt")) return "openai";
    if (modelName.includes("gemini")) return "google";
    if (modelName.includes("qwen") || modelName.includes("deepseek")) return "coding";
    if (modelName.includes("kimi") || modelName.includes("wizard")) return "budget";
    return "other";
  };

  const getModelIcon = (category: string) => {
    switch (category) {
      case "anthropic": return <Brain className="w-4 h-4" />;
      case "openai": return <Zap className="w-4 h-4" />;
      case "google": return <CheckCircle className="w-4 h-4" />;
      case "coding": return <Code className="w-4 h-4" />;
      case "budget": return <DollarSign className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "anthropic": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "openai": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "google": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "coding": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "budget": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter Model Selection</CardTitle>
          <CardDescription>Loading available models...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter Model Selection</CardTitle>
          <CardDescription className="text-red-600">
            Failed to load models: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenRouter Model Selection</CardTitle>
        <CardDescription>
          Choose from hundreds of AI models available through OpenRouter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selector */}
        <div className="space-y-2">
          <Label htmlFor="model-select">Select Model</Label>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a model..." />
            </SelectTrigger>
            <SelectContent>
              {models?.map((model) => {
                const category = getModelCategory(model.apiName);
                return (
                  <SelectItem key={model.apiName} value={model.apiName}>
                    <div className="flex items-center gap-2">
                      {getModelIcon(category)}
                      <div>
                        <div className="font-medium">{model.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {model.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Model Categories */}
        <div className="space-y-3">
          <Label>Available Categories</Label>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(models?.map(m => getModelCategory(m.apiName)) || [])).map(category => (
              <Badge key={category} variant="secondary" className={getCategoryColor(category)}>
                <span className="flex items-center gap-1">
                  {getModelIcon(category)}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Model Input */}
        <div className="space-y-2">
          <Label htmlFor="custom-model">Or use custom model ID</Label>
          <div className="flex gap-2">
            <input
              id="custom-model"
              type="text"
              placeholder="e.g., anthropic/claude-3.7-sonnet"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => customModel && handleModelChange(customModel)}
              disabled={!customModel}
              variant="outline"
            >
              Use Custom
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter any model ID available on OpenRouter (e.g., meta-llama/llama-3.1-405b-instruct)
          </p>
        </div>

        {/* Model Stats */}
        {selectedModel && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium mb-2">Selected Model Info</h4>
            {(() => {
              const model = models?.find(m => m.apiName === selectedModel);
              const category = model ? getModelCategory(model.apiName) : "other";
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getModelIcon(category)}
                    <span className="font-medium">{model?.displayName}</span>
                    <Badge variant="outline" className={getCategoryColor(category)}>
                      {category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{model?.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Context: {model?.contextWindow?.toLocaleString()} tokens</span>
                    <span>Max Output: {model?.maxOutputTokens?.toLocaleString()} tokens</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
