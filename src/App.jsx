import React, { useState, useEffect } from 'react';

function App() {
  const [access_token, setAccessToken] = useState('');
  const [refresh_token, setRefreshToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const getHashParams = () => {
      const hashParams = {};
      const regex = /([^&;=]+)=?([^&;]*)/g;
      const query = window.location.hash.substring(1);
      let match;

      while ((match = regex.exec(query)) !== null) {
        hashParams[match[1]] = decodeURIComponent(match[2]);
      }

      return hashParams;
    };

    const params = getHashParams();

    const fetchData = async () => {
      if (params.error) {
        setError('There was an error during the authentication');
      } else {
        if (params.access_token) {
          setAccessToken(params.access_token);

          try {
            const response = await fetch('https://api.spotify.com/v1/me', {
              headers: {
                Authorization: 'Bearer ' + params.access_token,
              },
            });

            const data = await response.json();

            // Render user profile
            // You may want to replace this with your own rendering logic
            console.log(data);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }

          setRefreshToken(params.refresh_token);
        }
      }
    };

    fetchData();
  }, []);

  const obtainNewToken = async () => {
    try {
      const response = await fetch('http://localhost:8888/refresh_token', {
        method: 'POST', // or 'GET' depending on your server implementation
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refresh_token,
        }),
      });

      const data = await response.json();

      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
    } catch (error) {
      console.error('Error obtaining new token:', error);
    }
  };

  return (
    <div className="container">
      {error ? (
        <h1>{error}</h1>
      ) : (
        <>
          <div id="login">
            <h1>This is an example of the Authorization Code flow</h1>
            <a href="http://localhost:8888/login" className="btn btn-primary">
              Log in with Spotify
            </a>
          </div>
          <div id="loggedin">
            <div id="user-profile">{/* Render user profile here */}</div>
            <div id="oauth">
              <h2>oAuth info</h2>
              <dl className="dl-horizontal">
                <dt>Access token</dt>
                <dd className="text-overflow">{access_token}</dd>
                <dt>Refresh token</dt>
                <dd className="text-overflow">{refresh_token}</dd>
              </dl>
            </div>
            <button className="btn btn-default" onClick={obtainNewToken}>
              Obtain new token using the refresh token
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
