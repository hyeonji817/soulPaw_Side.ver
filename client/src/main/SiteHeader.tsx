import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import Header from './Header';
import Header_loginOK from './Header_loginOK';

// Pages use this selector; each header owns its own markup and stylesheet.
export default function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    apiRequest('/auth/me')
      .then(() => { if (active) setSignedIn(true); })
      .catch(() => { if (active) setSignedIn(false); });
    return () => { active = false; };
  }, [pathname]);

  return signedIn ? <Header_loginOK /> : <Header />;
}
