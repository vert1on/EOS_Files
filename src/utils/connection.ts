import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import { PX } from "./utils";

export const chainId =
  "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906";
export const nodeBaseUrl = `${PX}https://eos.greymass.com/`;
export const nodeUrl = `${PX}https://eos.greymass.com/v1/chain/get_info`;
export const contractName = "eosfilemanag";

export const identifier = "identifier";

export const transport = new AnchorLinkBrowserTransport();

export const link = new AnchorLink({
  transport,
  chains: [
    {
      chainId: chainId,
      nodeUrl: nodeBaseUrl,
    },
  ],
});
