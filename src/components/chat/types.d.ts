import type { Components as ReactMarkdownComponents } from "react-markdown";
import type { ReactNode } from "react";

// Extend the ReactMarkdown Components type to include our custom components
declare module "react-markdown" {
  interface Components extends ReactMarkdownComponents {
    "scalix-write"?: (props: {
      children?: ReactNode;
      node?: any;
      path?: string;
      description?: string;
    }) => JSX.Element;
    "scalix-rename"?: (props: {
      children?: ReactNode;
      node?: any;
      from?: string;
      to?: string;
    }) => JSX.Element;
    "scalix-delete"?: (props: {
      children?: ReactNode;
      node?: any;
      path?: string;
    }) => JSX.Element;
    "scalix-add-dependency"?: (props: {
      children?: ReactNode;
      node?: any;
      package?: string;
    }) => JSX.Element;
  }
}

