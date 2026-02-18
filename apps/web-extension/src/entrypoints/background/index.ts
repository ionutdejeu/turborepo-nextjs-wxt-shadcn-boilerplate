import { BackgroundTrpcServer } from "@/trpc/background-trpc-server";

export default defineBackground(() => {
  const trpcServer = new BackgroundTrpcServer();
  trpcServer.register();

  console.log("Hello background!", { id: browser.runtime.id });
  // Handle extension icon click to open sidepanel
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Set up sidepanel options on install
  browser.runtime.onInstalled.addListener(async () => {
    await browser.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true
    });

    await browser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true
    });
  });
});
