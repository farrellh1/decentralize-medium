import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>Decentralize Medium</title>
        <link rel="icon" href="./favicon.ico"/>
      </Head>
      <ThirdwebProvider
        clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
        activeChain={Sepolia}
      >
        <Navbar />
        <Component {...pageProps} />
      </ThirdwebProvider>
    </div>
  );
}

export default MyApp;
