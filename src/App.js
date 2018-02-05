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
          {name: 'Hello', duration: 1234}
        ]
      },
      {
        name: 'My Favorites',
        songs: [
          {name:'Beat it', duration: 1234},
          {name: 'Hello', duration: 1234}
        ]
      },
      {
        name: 'My Favorites',
        songs: [
          {name:'Beat it', duration: 1234},
          {name: 'Hello', duration: 1234}
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
    // let totalDuration =
    return(
      <div style={{...defaultStyle, width: "40%", display: 'inline-block'}}>
        <h2>{allSongs.length} hours</h2>
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
    return(
      <div style={{...defaultStyle, display: 'inline-block', width: "25%"}}>
        <img/>
        <h3>Playlist Name</h3>
        <ul><li>Song 1</li><li>Song 2</li><li>Song 3</li></ul>
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
    // let name = 'Ram';
    // let headerStyle = {color: 'lightgreen', 'font-size': '50px'};
    return (
      <div className="App">
        {this.state.serverData.user ?
        <div>
          {this.state.serverData.user &&
          <h1 style={{...defaultStyle, 'font-size': '54px'}}>
            {this.state.serverData.user.name}'s Playlist
          </h1>}
            console.log('my state: ' this.state);
            <PlaylistCounter playlist={this.state.serverData.user.playlists}/>
            <HoursCounter playlist={this.state.serverData.user.playlists}/>
          <Filter />
          <Playlist />
          <Playlist />
          <Playlist />
          <Playlist />
        </div> : <h1 style={defaultStyle}>'Loading...'</h1>
        }
      </div>
    );
  }
}

export default App;
