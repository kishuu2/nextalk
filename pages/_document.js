// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="NextTalk helps people connect and chat effortlessly." />
          <link rel="icon" href="/nextalk/public/favicon.ico" />
          
          {/* ✅ Bootstrap CSS */}
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
            crossOrigin="anonymous"
          />

          {/* ✅ Bootstrap Icons */}
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
            rel="stylesheet"
          />
          
        </Head>
        <body>
          <Main />
          <NextScript />
          
          {/* ✅ Bootstrap JS Bundle (Optional) */}
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-ENjdO4Dr2bkBIFxQpeoAh632zV6L9ZZ6ms8x3Gk0tGLaZ1D2eAG0nNLD69Npy4HI"
            crossOrigin="anonymous"
          ></script>
        </body>
      </Html>
    );
  }
}
