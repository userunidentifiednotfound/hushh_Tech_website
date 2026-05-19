import React, { useEffect, useState } from 'react';
import { Box } from "@chakra-ui/react";
import { Helmet } from "react-helmet";
import { useSellTheWallLogic } from "./logic";

const SellTheWallPage = () => {
  const { pageTitle, pageDescription, iframeSrc, iframeTitle } = useSellTheWallLogic();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (iframeLoaded) return undefined;

    // Do not trap users behind the overlay if the third-party iframe never fires load.
    const timeoutId = window.setTimeout(() => {
      setIframeLoaded(true);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [iframeLoaded]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <Box
        as="main"
        id="main-content"
        position="fixed"
        top="64px"
        left="0"
        right="0"
        bottom="0"
        h={{ base: "calc(100dvh - 64px)", md: "calc(100vh - 64px)" }}
        overflow="hidden"
        margin="0"
        padding="0"
        zIndex="999"
        bg="white"
        aria-busy={!iframeLoaded}
        aria-label={iframeTitle}
      >
        {!iframeLoaded && (
          <Box
            position="absolute"
            inset="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="white"
            zIndex={1}
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Loading content</span>
          </Box>
        )}
        <Box
          as="iframe"
          src={iframeSrc}
          title={iframeTitle}
          allowFullScreen
          width="100%"
          height="100%"
          border="0"
          display="block"
          onLoad={() => setIframeLoaded(true)}
        />
      </Box>
    </>
  );
};

export default SellTheWallPage;
