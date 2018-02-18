// vim: syntax=JSX
import React, { Component } from 'react';
import 'reset-css/reset.css';
import logo from './logo.svg';
import './App.css';


import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import queryString from 'query-string';

// let options = ['Milliseconds', 'Seconds', 'Minutes', 'Hours']

let defaultStyle = {
  color: '#fff',
  fontFamily: 'FreeMono'
}
let counterStyle = {...defaultStyle,
  width: "40%",
  display: 'inline-block',
  marginBottom: '10px',
  fontSize: '14px',
  lineHeight: '30px',
}

// let dropdownPlaceholder = document.getElementsByClassName('Dropdown-placeholder')
// dropdownPlaceholder.style({backgroundColor: 'blue'})

class PlaylistCounter extends Component{
  render(){
    let playlistCounterStyle = counterStyle
    return(
      <div style={playlistCounterStyle}>
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
    let totalDuration = allSongs.reduce((accumulator, currentSong ) => {
      return accumulator + currentSong.duration
    }, 0)

    console.log('myOption: ', this.props.option);
    let selectedTime = !this.props.option? 'Hours' : this.props.option

      console.log('selectedTime: ', selectedTime);

    let parsedDuration = (totalDuration, selectedTime) => {

      console.log('inside pd totalDuration: ', totalDuration);
      console.log('inside pd selectedTime: ', selectedTime);

      let totalDurationMSec = Math.round(totalDuration)
      let totalDurationSec = totalDurationMSec / 1000
      let totalDurationMin = totalDurationSec / 60
      let totalDurationHour = totalDurationMin / 60

      let returnedDuration = selectedTime === 'Seconds' ? totalDurationSec
         : selectedTime === 'Minutes' ? totalDurationMin
         : selectedTime === 'Hours' ? totalDurationHour
         :                   totalDurationMSec

         console.log('inside returnedDuration: ', returnedDuration);
         return returnedDuration

    }

    console.log('pd: ', parsedDuration(totalDuration, selectedTime));
    let isTooLow = totalDuration < 1080000
    let hoursCounterStyle = {...counterStyle,
        color: isTooLow ? 'red' : 'green',
        fontWeight: isTooLow ? 'bold' : 'normal',
    }

    return(
      <div>
        <div style={hoursCounterStyle}>
        <h1>{parsedDuration(totalDuration, selectedTime)}</h1>
         {/*<h2>{Math.round(totalDuration)} hours</h2>
          <h2>
            {parseFloat(totalDuration / (1000 * 60 * 60))
                .toFixed(2)} hours
          </h2>*/}
        </div>
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
      filterString: '',
      selected: {
        label: 'Hours'
      },
      options : ['Milliseconds', 'Seconds', 'Minutes', 'Hours'],
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
      let playlists = playlistData.items
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
        trackDatas.forEach((trackData, i) => {
          playlists[i].trackDatas = trackData.items
          .map(item => item.track)
          .map(trackData => ({
            name: trackData.name,
            duration: trackData.duration_ms
          }))
        })
        return playlists
      })
      // console.log('playlistsPromise:', playlistsPromise);
      return playlistsPromise
    })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        // console.log('YOUR DATA: ', item.trackDatas)
        return {
          name: item.name,
          imageUrl: item.images[0].url,
          songs: item.trackDatas.slice(0,5)
        }
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
            // console.log('matchesPlaylist: ', matchesPlaylist)
          let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
            .includes(this.state.filterString.toLowerCase()))
            // console.log('matchesSong: ', matchesSong);
            return matchesPlaylist || matchesSong

      }) : []

      let reduceOptions =
        () => this.state.options.filter(o => o !== this.state.selected.label)

    return (
      <div className="App">
        {this.state.user ?
          <div>
            <h1 style={{...defaultStyle, 'fontSize': '54px'}}>
              {this.state.user.name}'s Playlist
            </h1>
              <PlaylistCounter playlists={playlistToRender} />
              <HoursCounter  playlists={playlistToRender} option={this.state.selected.label}/>
              <div className="dropdown-div">
                <Dropdown className="dropdown-class" options={reduceOptions()}
                  onChange={e => this.setState({selected: {label: e.label}})}
                  value={this.state.selected.label} placeholder="Select an option"
                />
              </div>
              <Filter style={{margin: '5px'}} onTextChange={text => {
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
