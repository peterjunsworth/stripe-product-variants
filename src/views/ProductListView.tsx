import { Box, Button, Spinner } from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from '@stripe/ui-extension-sdk/context';
import { useEffect, useState } from "react";
import {Header} from "../components";

const ProductListView = ({userContext, environment}: ExtensionContextValue) => {
  return (
    <Header
        title="Product Variants"
    >
      <>
        <Box css={{ 
          marginTop: "small",
          marginBottom: "small",
          font: "heading" 
        }}>
          Select A Product
        </Box>
        <Box css={{ 
          marginBottom: "small" 
        }}>
          Select a product to create variations, (e.g. color, size or material). A product variant is a copy of the base product with a new description and optional sku.
        </Box>
        <Box css={{ 
          marginBottom: "small" 
        }}>
          Only base products can have variants.
        </Box>
      </>
    </Header>
  );
}

export default ProductListView;