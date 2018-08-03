const clientId = '47424915c5094466a53c699d4368b333';
const redirectURI = 'http://localhost:3000/';
const authorizeURLBoiler = 'https://accounts.spotify.com/authorize';
const apiUrlBoiler = 'https://api.spotify.com/v1';

let accessToken = '';

const Spotify = {

  getAccessToken () {
    if (accessToken) {return accessToken};

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const tokenExpiresMatch = window.location.href.match(/expires_in=([^&]*)/);

    if(accessTokenMatch && tokenExpiresMatch) {
      accessToken = accessTokenMatch[1];
      let expireTime = Number(tokenExpiresMatch[1]);

      window.setTimeout(() => accessToken = '', expireTime * 1000);
      window.history.pushState('Access Token', null, '/');

      return accessToken;
    } else {
        const spotifyAuthURL= `${authorizeURLBoiler}?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
        window.location = spotifyAuthURL;
      }
    },

    search (searchTerm) {
      const searchURL = `${apiUrlBoiler}/search?type=track&q=${searchTerm}`;
      const accessToken = Spotify.getAccessToken();

      return fetch(searchURL, {
              headers: {Authorization: `Bearer ${accessToken}`}
              }).then (response => {return response.json();
              }).then (jsonResponse => {
                  if (jsonResponse.tracks){
                    return jsonResponse.tracks.items.map(track => ({
                      id: track.id,
                      name: track.name,
                      artist: track.artists[0].name,
                      album: track.album.name,
                      uri: track.uri
                    }))
                  }
              })

    },

    savePlaylist (playlistName, trackURIs){
      if (!playlistName || !trackURIs.length) {return;}

      const accessToken = Spotify.getAccessToken();
      const header = {Authorization: `Bearer ${accessToken}`};
      let userId;

      return fetch (`${apiUrlBoiler}/me`, {headers: header}
             ).then(response => response.json()
              ).then(jsonResponse => {
                userId = jsonResponse.id;
                return fetch (`${apiUrlBoiler}/users/${userId}/playlists`, {
                        headers: header,
                        method: 'POST',
                        body: JSON.stringify({name: playlistName})
                      }).then(response => response.json()
                        ).then(jsonResponse => {
                          const playlistId = jsonResponse.id;;
                          return fetch (`${apiUrlBoiler}/users/${userId}/playlists/${playlistId}/tracks`, {
                            headers: header,
                            method: 'POST',
                            body: JSON.stringify({uris: trackURIs})
                          });
                        });
              });

    }
};

export default Spotify;
