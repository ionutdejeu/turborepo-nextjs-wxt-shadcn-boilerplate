import { FloatingActionButton } from "@/components/floating-action-button";
import { AppPanel } from "@/components/app-panel";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/storage";
import "@/styles/globals.css";
import { useEffect, useState, useCallback } from "react";
import { Trigger } from "@/types/trigger";
import { App } from "@/app/app";
import { contentTrpcClient } from "@/trpc/content-trpc-client";

function AppWrapper() {
  const [isVisible, setIsVisible] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  useEffect(() => {
    store.settings
      .getValue()
      .then((settings) => setShowFloatingButton(settings.showFloatingActionButton ?? true));
    const unwatch = store.settings.watch((settings) =>
      setShowFloatingButton(settings.showFloatingActionButton ?? true)
    );
    return () => unwatch();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        toggleVisibility();
      }
    },
    [isVisible]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const sendTestMessage = async () => {
    if (isSendingMessage) {
      return;
    }

    setIsSendingMessage(true);

    try {
      const response = await contentTrpcClient.client.sendMessage.mutate({
        message: "hello from content script",
      });

      console.log("tRPC message response", response);
    } catch (error) {
      console.error("Failed to send content test message", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <>
      {showFloatingButton && (
        <div aria-live="polite" className="flex items-center gap-2">
          <Button onClick={sendTestMessage} size="sm" variant="secondary" disabled={isSendingMessage}>
            {isSendingMessage ? "Sending..." : "Send test"}
          </Button>
          <FloatingActionButton onClick={toggleVisibility} />
        </div>
      )}
      <AppPanel isVisible={isVisible} trigger={Trigger.CONTENT}>
        <App />
      </AppPanel>
    </>
  );
}

export default AppWrapper;
