import React from 'react';
import './App.css';
import Playlist from './Components/Playlist/Playlist';
import SearchBar from './Components/SearchBar/SearchBar';
import SearchResults from './Components/SearchResults/SearchResults';
import Spotify from './util/Spotify';

export default class App extends React.Component {

  constructor (props) {
    super (props)

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);

    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    };
  }

  addTrack (track) {
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    } else {
      let tracks = this.state.playlistTracks;
      tracks.push(track);
      this.setState({playlistTracks: tracks})};
  }

  removeTrack (track) {
    let tracks = this.state.playlistTracks;
    let targetId = this.state.playlistTracks.findIndex(_track => _track.id === track.id);

    if (targetId > -1) {
      tracks.splice(targetId, 1);
      this.setState({playListTracks: tracks});
    }else{return;}
  }

  updatePlaylistName (name) {
    this.setState({playlistName: name});
  }

  savePlaylist () {
    const trackURIs = this.state.playlistTracks.map(track => track.uri)
    Spotify.savePlaylist(this.state.playlistName, trackURIs
      ).then(() => {
        this.setState({
          playlistName: 'New Playlist',
          playlistTracks: []
        });
      });
  }

  search (term) {
    Spotify.search(term).then(tracks => {
      this.setState({searchResults: tracks});
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
            <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack}/>
            <Playlist playlistName={this.state.playlistName}
                      playlistTracks={this.state.playlistTracks}
                      onRemove={this.removeTrack}
                      onNameChange={this.updatePlaylistName}
                      onSave={this.savePlaylist}/>
          </div>
        </div>
      </div>
    );
  }
}
