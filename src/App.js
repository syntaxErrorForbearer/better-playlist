// vim: syntax=JSX
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

let defaultStyle = {
  color: '#fff',
};
let fakeServerData = {
  user: {
    name: 'Rambo',
    playlists: [
      {
        name: 'Favorites',
        songs: [
          {name:'Beat it', duration: 1234},
          {name: 'Hello', duration: 12.96}
        ]
      },
      {
        name: 'The right Stuff',
        songs: [
          {name:'Beat it1', duration: 1234},
          {name: 'Hello1', duration: 1234}
        ]
      },
      {
        name: 'the good stuff',
        songs: [
          {name:'Beat it2', duration: 1.234},
          {name: 'Hello2', duration: 1234}
        ]
      }
    ]
  }
};

class PlaylistCounter extends Component{
  render(){
    return(
      <div style={{...defaultStyle, width: "40%", display: 'inline-block'}}>
        <h2>{this.props.playlists.length} playlists</h2>
      </div>
    );
  }
}

class HoursCounter extends Component{
  render(){
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs)
    },[])
    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration
    }, 0)
    return(
      <div style={{...defaultStyle, width: "40%", display: 'inline-block'}}>
        <h2>
          {parseFloat(totalDuration/60)
              .toFixed(2)} hours
        </h2>
      </div>
    );
  }
}

class Filter extends Component{
  render(){
    return(
      <div style={{defaultStyle}}>
        <img/>
        <input type="text" onKeyUp={(e) => this.props.onTextChange(e.target.value) }/>
      </div>
    )
  }
}

class Playlist extends Component{
  render(){
    let playlist = this.props.playlist
    return(
      <div style={{...defaultStyle, display: 'inline-block', width: "25%"}}>
        <img/>
        <h3>{playlist.name}</h3>
        <ul>
          {this.props.playlist.songs.map(song =>
            <li key={song.name}>{song.name}</li>
          )}
        </ul>
      </div>
    )
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      serverData: {},
      filterString: ''
    }
  }
  componentDidMount() {
    setTimeout( () => {
      this.setState({serverData: fakeServerData });
    }, 1000);
  }
  render() {
    let playlistToRender = this.state.serverData.user ? this.state.serverData.user.playlists
      .filter(playlist =>
        playlist.name.toLowerCase().includes(
          this.state.filterString.toLowerCase())
      ) : []

    return (
      <div className="App">
        {this.state.serverData.user ?
        <div>
          <h1 style={{...defaultStyle, 'fontSize': '54px'}}>
            {this.state.serverData.user.name}'s Playlist
          </h1>
          <PlaylistCounter playlists={playlistToRender} />
          <HoursCounter playlists={playlistToRender} />
          <Filter onTextChange={text => {
            this.setState({filterString: text})
          }}/>
          {playlistToRender.map(playlist =>
            <Playlist playlist={playlist} />
          )}
        </div> : <h1 style={defaultStyle}>'Loading...'</h1>
        }
      </div>
    );
  }
}

export default App;
