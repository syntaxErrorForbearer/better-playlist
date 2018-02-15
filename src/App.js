// vim: syntax=JSX
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import queryString from 'query-string';

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
       {/*<h2>{Math.round(totalDuration)} hours</h2>*/}
        <h2>
          {parseFloat(totalDuration / (1000 * 60 * 60))
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
      <div style={{...defaultStyle, display: 'inline-block', width: '25%'}}>
        <img src={playlist.imageUrl} style={{width: '70%', marginTop: '10%'}} />
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
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token
    if (!accessToken)
      return;
   fetch('https://api.spotify.com/v1/me', {
     headers: {'Authorization': 'Bearer ' + accessToken}
   }).then(response => response.json())
   .then(data => this.setState({
     user: {
       name: data.display_name
     }
   }))

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(playlistData => {
      console.log("playlistData: ", playlistData)
      let playlists = playlistData.items
      console.log("playlists: ", playlists)
      let trackDataPromises = playlists.map(playlist => {
        let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + accessToken}
        })
        let trackDataPromise = responsePromise
          .then(response => response.json())
        return trackDataPromise
      })
      let allTracksDataPromises =
        Promise.all(trackDataPromises)
      let playlistsPromise = allTracksDataPromises.then(trackDatas => {
        console.log("trackDatas: ", trackDatas);
        trackDatas.forEach((trackData, i) => {
          playlists[i].trackDatas = trackData.items
          .map(item => item.track)
          .map(trackData => ({
            name: trackData.name,
            duration: trackData.duration_ms
          }))
        })
        console.log("after op playlists: ", playlists)
        return playlists
      })
      console.log('playlistsPromise:', playlistsPromise);
      return playlistsPromise
    })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        console.log('YOUR DATA: ', item.trackDatas)
        return {
          name: item.name,
          imageUrl: item.images[0].url,
          songs: item.trackDatas.slice(0,3)        }
      })
    }))

  }
  render() {
    let playlistToRender =
     this.state.user &&
     this.state.playlists
      ? this.state.playlists.filter(playlist => {
          let matchesPlaylist = playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase())
            console.log('matchesPlaylist: ', matchesPlaylist)
          let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
            .includes(this.state.filterString.toLowerCase()))
            console.log('matchesSong: ', matchesSong);
            return matchesPlaylist || matchesSong

      }) : []


    return (
      <div className="App">
        {this.state.user ?
          <div>
            <h1 style={{...defaultStyle, 'fontSize': '54px'}}>
              {this.state.user.name}'s Playlist
            </h1>
              <PlaylistCounter playlists={playlistToRender} />
              <HoursCounter playlists={playlistToRender} />
              <Filter onTextChange={text => {
                this.setState({filterString: text})
              }}/>
              {playlistToRender.map(playlist =>
                <Playlist playlist={playlist} />
              )}

          </div> : <button onClick={() => {
            window.location = window.location.href.includes('localhost')
              ? 'http://localhost:8888/login'
              : 'https://better-playlists-backend-4-you.herokuapp.com/login' }
              // : 'https://better-playlists-backend-4-you.herokuapp.com/login' }
            }
            style={{padding: '20px', 'fontSize': '50px', 'marginTop': '20px'}}>Sign in to Spotify</button>
        // {/*</div> : <button onClick={() => window.location = 'http://localhost:8888/login'}*/}
          //{{/*<h1 style={defaultStyle}>'Loading...'</h1>*/}}
        }
      </div>
    );
  }
}

export default App;
