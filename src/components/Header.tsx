import { ContextView } from "@stripe/ui-extension-sdk/ui";
const FEDIcon =  require("../assets/fed-logo.svg");

const Header = ({ title = "Product Varients", ...contextViewProps }) => (
  <ContextView
    title={title}
    brandColor="#00102e"
    brandIcon={FEDIcon}
    {...contextViewProps}
  ></ContextView>
);

export default Header;