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
        name: 'My Favorites',
        songs: [
          {name:'Beat it', duration: 1234},
          {name: 'Hello', duration: 12.96}
        ]
      },
      {
        name: 'My Favorites1',
        songs: [
          {name:'Beat it1', duration: 1234},
          {name: 'Hello1', duration: 1234}
        ]
      },
      {
        name: 'My Favorites2',
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
        <input type="text"/>
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
            <li>{song.name}</li>
          )}
        </ul>
      </div>
    )
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {serverData: {}};
  }
  componentDidMount() {
    /*
    setTimeout( () => {
      this.setState({ serverData: fakeServerData });
    }, 1000);
    */
    this.setState({ serverData: fakeServerData });
  }


  render() {
    //let playlistElements =[];
/*
    // forEach() example *slightly better than for loop
    if (this.state.serverData.user) {
      this.state.serverData.user.playlist.forEach(playlist =>
        playlistElements.push(<Playlist playlist={playlist} />)
      )
    }
    // for loop *works but it ain't pretty
      for (let i = 0; i < this.state.serverData.user.playlists.length; i++) {
        let playlist = this.state.serverData.user.playlists[i]
        playlistElements.push(<Playlist playlist={playlist} />)
      }
    }
    {playlistElements} <- elements array

*/

    return (
      <div className="App">
        {this.state.serverData.user ?
        <div>
          <h1 style={{...defaultStyle, 'font-size': '54px'}}>
            {this.state.serverData.user.name}'s Playlist
          </h1>
            <PlaylistCounter playlists={this.state.serverData.user.playlists}/>
            <HoursCounter playlists={this.state.serverData.user.playlists}/>
          <Filter />
          {/* Map example **best practice**/}
          {this.state.serverData.user.playlists.map(playlist =>
            <Playlist playlist={playlist}/>
          )}
        </div> : <h1 style={defaultStyle}>'Loading...'</h1>
        }
      </div>
    );
  }
}

export default App;
