import {
    Box,
    Link,
    Icon,
    Inline
  } from '@stripe/ui-extension-sdk/ui';
  import type { ExtensionContextValue } from '@stripe/ui-extension-sdk/context';
  import {Header} from "../components";
  
  const HomeOverviewView = ({environment, userContext}: ExtensionContextValue) => {
    return (
      <Header
        title="Get started by adding some products">
        <Box css={{font: 'heading'}}>
          Welcome {userContext.account.name}
        </Box>
        <Box css={{marginTop: 'small'}}>
          This app is designed to create parent / variant relationships between products.
        </Box>
        <Box css={{marginTop: 'small'}}>
          When products and variants are setup, the Stripe API allows you to retrieve products based on their relationships. See the app listing for API examples.
        </Box>
  
        <Box css={{
          marginTop: 'xlarge',
          padding: 'medium',
          background: 'container',
          borderRadius: 'medium',
        }}>
          <Box css={{stack: 'x', distribute: 'space-between', alignY: 'center', width: 'fill'}}>
            <Link  href="products"><Inline>Products</Inline></Link>
            <Box css={{ color: "info"}}>
              <Icon name="next" />
            </Box>
          </Box>
        </Box>
      </Header>
    );
  };
  
  export default HomeOverviewView;