declare module "react-resize-panel" {
  import { CSSProperties } from "react";

  interface ResizePanelProps {
    direction: "s" | "e" | "w" | "n";
    containerClass?: string;
    handleClass?: string;
    borderClass?: string;
    style?: CSSProperties;
    children?: React.ReactNode
  }

  export default class ResizePanel extends React.Component<ResizePanelProps, any> {}
}