import { useEffect, useState } from "react";
import { 
  Box, 
  Button, 
  ContextView, 
  Divider, 
  Icon, 
  Img, 
  Inline, 
  Link, 
  List, 
  ListItem, 
  Spinner, 
  TextField 
} from "@stripe/ui-extension-sdk/ui";
import { showToast } from '@stripe/ui-extension-sdk/utils';
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import {createHttpClient, STRIPE_API_KEY} from '@stripe/ui-extension-sdk/http_client';
import Stripe from 'stripe';
import {Header} from "../components";

// Initiate communication with the stripe client.
const stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient(),
  apiVersion: '2023-10-16',
})

const ProductDetailView = ({userContext, environment}: ExtensionContextValue) => {

  const [shown, setShown] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<object>({});
  const [product, setProduct] = useState<object>({});
  const [productUrl, setProductUrl] = useState<string>("/products");
  const [isVariant, setIsVariant] = useState<boolean>(false);
  const [price, setPrice] = useState<object>({});
  const [variants, setVariants] = useState<array>([]);
  const [productEditUrl, setProductEditUrl] = useState<string>("");

  const product_id = `${environment.objectContext?.id}`;
  
  useEffect(() => {
    const getProductData = async (product_id: string) => {
      try {
        const productData = await stripe.products.retrieve(product_id, {
          expand: ['default_price'],
        });
        if (productData?.metadata?.parentProduct) {
          setMetadata(productData?.metadata)
          setIsVariant(true);
          return;
        }
        const productPrice = await stripe.prices.search({
          query: 'product:\'' + product_id + '\''
        })
        setPrice(productPrice.data[0]);
        const metadata = productData.metadata;
        setProduct(Object.assign({}, { 
          attributes: productData.attributes, 
          images: productData.images, 
          name: productData.name,
          description: productData.description,
          metadata: {
            ...metadata,
            parentProduct: product_id
          }
        }));
        const variants = await stripe.products.search({
          query: 'active:\'true\' AND metadata[\'parentProduct\']:\'' + product_id + '\''
        });
        console.log(variants);
        setVariants(variants.data);
      } catch (error) {
        console.log(error);
      }
    };
    getProductData(product_id);
  }, [product_id]);

  const deleteVariant = async (variant_id: string, index: number) => {
    try {
      const product = await stripe.products.update(
        variant_id,
        {
          active: false
        }
      );
      if (product) {
        const variantObjects = variants;
        variantObjects.splice(index, 1);
        showToast("Product archived", {type: "success"});
      }
    } catch (error) {
      console.log(error);
      showToast("Product not archived", {type: "caution"});
    }
  }

  const saveVariations = async () => {
    try {
      setShown(false);
      console.log(product);
      const variantData = {
        currency: price.currency,
        unit_amount: price.unit_amount,
        product_data: {
          ...product,
          name: product.name,
          description: product.description || ""
        },
      }
      if (variantData.product_data.description.length === 0) delete variantData.product_data.description;
      if (price.recurring) variantData.recurring = price.recurring;
      const newPrice = await stripe.prices.create(variantData);
      showToast("Product added", {type: "success"});
      setProductEditUrl(`https://${location.hostname}${productUrl}/${newPrice.product}?edit=${newPrice.product}&source=product_detail`);
      setVariants([...variants, {
        id: newPrice.product,
        name: product.name,
        description: product.description
      }]);
      setShown(true);
    } catch (error) {
      console.log(error);
      showToast("Product not saved", {type: "caution"});
    }
  }

  return (
    <Header
      title="Product Variants"
    >
      <>
        {!isVariant && (
          <Box
            css={{}}
          >
            {variants.length === 0 ?
              <Box css={{ 
                marginBottom: "large" 
              }}>
                This product does not have any variants.
              </Box>
            :
              <>
                <Box css={{ 
                  marginBottom: "large" 
                }}>
                  This product has {variants.length} variants. Add, update and archive each variation individually.
                </Box>
                <Box css={{ 
                  font: "heading",
                  marginBottom: "small" 
                }}>
                  Variants
                </Box>
              </>
            }
            {shown && (
              <>
                {variants.map((variant: object, index: number) => (
                  <Box
                    key={variant.id}
                  >
                    <Box
                      css={{
                        stack: 'x',
                        gap: "small",
                        width: 'fill',
                        alignY: 'center',
                      }}
                    >
                      <Box css={{
                        width: '8/12'
                      }}>
                        <Link 
                          href={productUrl + "/" + variant.id}
                          key={variant.id}
                        >
                          <Box css={{ 
                            textOverflow: 'ellipsis', 
                            overflow: 'hidden', 
                            whiteSpace: 'nowrap', 
                            wordWrap: 'normal',
                            width: '11/12'
                          }}>
                            {variant?.name}
                          </Box>
                        </Link>
                        <Box>
                          Description: {variant?.description}
                        </Box>
                      </Box>
                      <Box css={{width: '1/12', padding: 'medium'}}>
                        <Button href={"https://" + location.hostname + productUrl + '/' + variant.id} type="primary">
                        <Icon name="edit" />
                        </Button>
                      </Box>
                      <Box css={{width: '1/12', padding: 'medium'}}>
                        <Button onPress={() => deleteVariant(variant.id, index)} type="primary">
                        <Icon name="trash" />
                        </Button>
                      </Box>
                    </Box>
                    {variants.length > 1 && (
                      <Box
                        css={{
                          marginY: "medium"
                        }}
                      >
                        <Divider />
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            )}
          </Box>
        )}
        {!isVariant && (
          <>
            <Box
              css={{
                marginTop: "large",
                marginBottom: "large" 
              }}>
                {productEditUrl.length > 0 && (
                  <Box
                    css={{
                      marginBottom: "large" 
                    }}
                  >
                    <Button 
                      type="primary"
                      href={productEditUrl}>Edit New Variant
                    </Button>
                  </Box>
                )}
                <Button 
                  type={!productEditUrl.length ? "primary" : "secondary"}
                  onPress={() => {
                    saveVariations();
                  }}>{!productEditUrl.length ? "Create New Variant" : "Create Another Variant"}
                </Button>
            </Box>
          </>
        )}
        {isVariant && (
          <Box
            css={{
              marginTop: "medium" 
            }}>
              <Box css={{ 
                marginBottom: "large" 
              }}>
                This product is a variant. Add additional variations to the parent product.
              </Box>
              <Button 
                href={"https://" + location.hostname + productUrl + '/' + metadata?.parentProduct} 
                onPress={() => setIsVariant(false)}
                type="primary">
                  View Parent Product
              </Button>
          </Box>
        )}
      </>
    </Header>
  );
};

export default ProductDetailView;
