import React, { useEffect, useRef, memo } from 'react';
import { useAuth } from '../App';

interface TradingViewWidgetProps {
  symbol: string;
  interval?: string;
}

function TradingViewWidget({ symbol, interval = 'D' }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const currentContainer = container.current;
    if (!currentContainer) return;

    // Clear any existing content
    currentContainer.innerHTML = '';

    // Create the widget container div
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';
    currentContainer.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      "autosize": true,
      "symbol": `BSE:${symbol}`,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": theme || "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "hide_side_toolbar": false,
      "withdateranges": true,
      "details": true,
      "hotlist": true,
      "calendar": false,
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "support_host": "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(config);
    currentContainer.appendChild(script);

    return () => {
      isMounted = false;
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%", position: 'relative' }}
    >
      {/* The widget and script will be injected here by the useEffect */}
    </div>
  );
}

export default memo(TradingViewWidget);
