// pages/_app.js
import './styles/globals.css'; // or wherever your styles are
import { ThemeProvider } from './Components/ThemeContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
