import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useSettings } from "@/hooks/useSettings";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateCard } from "@/components/TemplateCard";
import { CreateAppDialog } from "@/components/CreateAppDialog";
import { NeonConnector } from "@/components/NeonConnector";
import { GitHubIntegration } from "@/components/GitHubIntegration";
import { VercelIntegration } from "@/components/VercelIntegration";
import { SupabaseIntegration } from "@/components/SupabaseIntegration";
import { StripeConnector } from "@/components/StripeConnector";
import { RazorpayConnector } from "@/components/RazorpayConnector";
import { AwsS3Connector } from "@/components/AwsS3Connector";
import { CloudflareR2Connector } from "@/components/CloudflareR2Connector";
import { SendGridConnector } from "@/components/SendGridConnector";
import { ResendConnector } from "@/components/ResendConnector";
import { MixpanelConnector } from "@/components/MixpanelConnector";
import { SentryConnector } from "@/components/SentryConnector";

const HubPage: React.FC = () => {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { templates, isLoading } = useTemplates();
  const { settings, updateSettings } = useSettings();
  const selectedTemplateId = settings?.selectedTemplateId;

  const handleTemplateSelect = (templateId: string) => {
    updateSettings({ selectedTemplateId: templateId });
  };

  const handleCreateApp = () => {
    setIsCreateDialogOpen(true);
  };
  // Separate templates into official and community
  const officialTemplates =
    templates?.filter((template) => template.isOfficial) || [];
  const communityTemplates =
    templates?.filter((template) => !template.isOfficial) || [];

  return (
    <div className="min-h-screen px-8 py-4">
      <div className="max-w-5xl mx-auto pb-12">
        <Button
          onClick={() => router.history.back()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-4 bg-(--background-lightest) py-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <header className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hub
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400">
            Choose templates and connect to external services for your projects.
            {isLoading && " Loading additional templates..."}
          </p>
        </header>

        {/* Official Templates Section */}
        {officialTemplates.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Official templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {officialTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={template.id === selectedTemplateId}
                  onSelect={handleTemplateSelect}
                  onCreateApp={handleCreateApp}
                />
              ))}
            </div>
          </section>
        )}

        {/* Community Templates Section */}
        {communityTemplates.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Community templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={template.id === selectedTemplateId}
                  onSelect={handleTemplateSelect}
                  onCreateApp={handleCreateApp}
                />
              ))}
            </div>
          </section>
        )}

        <BackendSection />
      </div>

      <CreateAppDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        template={templates.find((t) => t.id === settings?.selectedTemplateId)}
      />
    </div>
  );
};

function BackendSection() {
  return (
    <div class="">
      <header className="mb-4 text-left">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Integrations & Services
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400">
          Connect to external services and set up your project infrastructure.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Database Integrations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Databases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeonConnector />
            <SupabaseIntegration />
          </div>
        </div>

        {/* Deployment & Hosting */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Deployment & Hosting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VercelIntegration />
          </div>
        </div>

        {/* Payment Providers */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StripeConnector />
            <RazorpayConnector />
          </div>
        </div>

        {/* Cloud Storage */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Cloud Storage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AwsS3Connector />
            <CloudflareR2Connector />
          </div>
        </div>

        {/* Email Services */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Email Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SendGridConnector />
            <ResendConnector />
          </div>
        </div>

        {/* Analytics */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MixpanelConnector />
          </div>
        </div>

        {/* Monitoring */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monitoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SentryConnector />
          </div>
        </div>

        {/* Version Control & Collaboration */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Version Control & Collaboration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GitHubIntegration />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HubPage;

