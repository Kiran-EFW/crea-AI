import { useState, useEffect, useCallback } from "react";
import { useSettings } from "./useSettings";
import { useLoadApp } from "./useLoadApp";
import { IpcClient } from "@/ipc/ipc_client";
import { showError, showSuccess } from "@/lib/toast";
import { UserSettings } from "@/lib/schemas";

export interface GitHubConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  userCode: string | null;
  verificationUri: string | null;
  error: string | null;
  statusMessage: string | null;
  userEmail?: string;
}

export interface AppGitHubState {
  isConnected: boolean;
  org: string | null;
  repo: string | null;
  branch: string | null;
  lastSync?: Date;
}

export function useGitHubConnection(appId?: number | null) {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { app, refreshApp } = useLoadApp(appId || null);

  const [connectionState, setConnectionState] = useState<GitHubConnectionState>({
    isConnected: !!settings?.githubAccessToken,
    isConnecting: false,
    userCode: null,
    verificationUri: null,
    error: null,
    statusMessage: null,
    userEmail: settings?.githubUser?.email,
  });

  const [appGitHubState, setAppGitHubState] = useState<AppGitHubState>({
    isConnected: !!(app?.githubOrg && app?.githubRepo),
    org: app?.githubOrg || null,
    repo: app?.githubRepo || null,
    branch: app?.githubBranch || null,
  });

  // Update connection state when settings change
  useEffect(() => {
    setConnectionState(prev => ({
      ...prev,
      isConnected: !!settings?.githubAccessToken,
      userEmail: settings?.githubUser?.email,
    }));
  }, [settings?.githubAccessToken, settings?.githubUser?.email]);

  // Update app GitHub state when app changes
  useEffect(() => {
    setAppGitHubState({
      isConnected: !!(app?.githubOrg && app?.githubRepo),
      org: app?.githubOrg || null,
      repo: app?.githubRepo || null,
      branch: app?.githubBranch || null,
    });
  }, [app?.githubOrg, app?.githubRepo, app?.githubBranch]);

  // Set up IPC listeners for device flow
  useEffect(() => {
    if (!appId) return;

    const cleanupFunctions: (() => void)[] = [];

    // Listener for device flow updates
    const removeUpdateListener = IpcClient.getInstance().onGithubDeviceFlowUpdate((data) => {
      setConnectionState(prev => ({
        ...prev,
        userCode: data.userCode || null,
        verificationUri: data.verificationUri || null,
        statusMessage: data.message || null,
        error: null,
        isConnecting: !data.userCode && !data.verificationUri && data.message ? true : prev.isConnecting,
      }));
    });
    cleanupFunctions.push(removeUpdateListener);

    // Listener for device flow success
    const removeSuccessListener = IpcClient.getInstance().onGithubDeviceFlowSuccess((data) => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        userCode: null,
        verificationUri: null,
        error: null,
        statusMessage: "Successfully connected to GitHub!",
      }));
      refreshSettings();
    });
    cleanupFunctions.push(removeSuccessListener);

    // Listener for device flow error
    const removeErrorListener = IpcClient.getInstance().onGithubDeviceFlowError((data) => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        userCode: null,
        verificationUri: null,
        error: data.error || "An unknown error occurred.",
        statusMessage: null,
      }));
    });
    cleanupFunctions.push(removeErrorListener);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [appId, refreshSettings]);

  const startDeviceFlow = useCallback(async () => {
    if (!appId) {
      showError("No app selected");
      return;
    }

    setConnectionState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
      userCode: null,
      verificationUri: null,
      statusMessage: "Requesting device code from GitHub...",
    }));

    try {
      await IpcClient.getInstance().startGithubDeviceFlow(appId);
    } catch (error: any) {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to start GitHub authentication",
      }));
    }
  }, [appId]);

  const startOAuthFlow = useCallback(async () => {
    try {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      if (settings?.isTestMode) {
        await IpcClient.getInstance().fakeHandleGithubConnect();
      } else {
        await IpcClient.getInstance().openExternalUrl(
          "https://oauth.scalix.world/api/integrations/github/login"
        );
      }
    } catch (error: any) {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to start GitHub OAuth",
      }));
    }
  }, [settings?.isTestMode]);

  const disconnect = useCallback(async () => {
    try {
      const result = await updateSettings({
        githubAccessToken: undefined,
        githubUser: undefined,
      });

      if (result) {
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          userCode: null,
          verificationUri: null,
          error: null,
          statusMessage: null,
          userEmail: undefined,
        }));
        showSuccess("Successfully disconnected from GitHub");
      } else {
        showError("Failed to disconnect from GitHub");
      }
    } catch (error: any) {
      showError(error.message || "An error occurred while disconnecting from GitHub");
    }
  }, [updateSettings]);

  const disconnectAppRepo = useCallback(async () => {
    if (!appId) return;

    try {
      await IpcClient.getInstance().disconnectGithubRepo(appId);
      refreshApp();
      showSuccess("Successfully disconnected repository");
    } catch (error: any) {
      showError(error.message || "Failed to disconnect repository");
    }
  }, [appId, refreshApp]);

  const syncAppRepo = useCallback(async (force: boolean = false) => {
    if (!appId) return;

    try {
      const result = await IpcClient.getInstance().syncGithubRepo(appId, force);
      if (result.success) {
        refreshApp();
        showSuccess("Successfully synced with GitHub");
        return true;
      } else {
        showError(result.error || "Failed to sync with GitHub");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Failed to sync with GitHub");
      return false;
    }
  }, [appId, refreshApp]);

  const createRepo = useCallback(async (
    org: string,
    name: string,
    branch: string = "main"
  ) => {
    if (!appId) return false;

    try {
      await IpcClient.getInstance().createGithubRepo(org, name, appId, branch);
      refreshApp();
      showSuccess("Repository created and linked successfully");
      return true;
    } catch (error: any) {
      showError(error.message || "Failed to create repository");
      return false;
    }
  }, [appId, refreshApp]);

  const connectToExistingRepo = useCallback(async (
    owner: string,
    repo: string,
    branch: string
  ) => {
    if (!appId) return false;

    try {
      await IpcClient.getInstance().connectToExistingGithubRepo(owner, repo, branch, appId);
      refreshApp();
      showSuccess("Successfully connected to repository");
      return true;
    } catch (error: any) {
      showError(error.message || "Failed to connect to repository");
      return false;
    }
  }, [appId, refreshApp]);

  const checkRepoAvailability = useCallback(async (org: string, name: string) => {
    try {
      return await IpcClient.getInstance().checkGithubRepoAvailable(org, name);
    } catch (error: any) {
      showError(error.message || "Failed to check repository availability");
      return { available: false, error: error.message };
    }
  }, []);

  const listRepos = useCallback(async () => {
    try {
      return await IpcClient.getInstance().listGithubRepos();
    } catch (error: any) {
      showError(error.message || "Failed to load repositories");
      return [];
    }
  }, []);

  const getRepoBranches = useCallback(async (owner: string, repo: string) => {
    try {
      return await IpcClient.getInstance().getGithubRepoBranches(owner, repo);
    } catch (error: any) {
      showError(error.message || "Failed to load branches");
      return [];
    }
  }, []);

  return {
    // Global GitHub connection state
    globalConnection: connectionState,

    // App-specific GitHub state
    appConnection: appGitHubState,

    // Actions
    startDeviceFlow,
    startOAuthFlow,
    disconnect,
    disconnectAppRepo,
    syncAppRepo,
    createRepo,
    connectToExistingRepo,
    checkRepoAvailability,
    listRepos,
    getRepoBranches,

    // Utilities
    refreshSettings,
    refreshApp,
  };
}
