import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useLayoutEffect, useRef } from "react";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";

const UIToolKit = () => {
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const preview = previewContainerRef;
    uitoolkit.openPreview(preview.current!);
    return () => {
      try {
        uitoolkit.closePreview(preview.current!);
      } catch (e) {
        console.log("Error closing uitoolkit preview", e);
      }
    };
  }, []);
  return <div id="preview" className="mb-8 mt-8 flex flex-1 self-center" ref={previewContainerRef} />;
};

export default UIToolKit;
