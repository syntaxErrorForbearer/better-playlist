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
  marginBottom: '20px',
  fontSize: '20px',
  lineHeight: '30px',
}

function isEven(num) {
  return num % 2
}

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
    },[]),
    totalDuration = allSongs.reduce((accumulator, currentSong ) => {
      return accumulator + currentSong.duration
    }, 0),
    selectedTime = !this.props.option? 'Hours' : this.props.option

    function parsedDuration(totalDuration, selectedTime){

      let totalDurationMSec = totalDuration,
       totalDurationSec = totalDurationMSec / 1000,
       totalDurationMin = totalDurationSec / 60,
       totalDurationHour = totalDurationMin / 60

      let returnedDuration = selectedTime === 'Seconds' ? totalDurationSec
         : selectedTime === 'Minutes' ? totalDurationMin
         : selectedTime === 'Hours' ? totalDurationHour
         :                   totalDurationMSec

      return ((number, precision) => {
         var factor = Math.pow(10, precision);
         return Math.round(number * factor) / factor;
      })(returnedDuration, 2)
    }
    let totalTime = parsedDuration(totalDuration, selectedTime),
    isTooLow = parsedDuration(totalDuration, 'Hours') < .5,
    hoursCounterStyle = {...counterStyle,
        color: isTooLow ? 'rgb(187, 19, 169)' : 'rgb(213, 249, 222)',
        fontWeight: isTooLow ? 'bold' : 'normal',
    }

    return(
      <div>
        <div style={hoursCounterStyle}>
        <h1>{totalTime}</h1>
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
        <input type="text" onKeyUp={(e) =>
           this.props.onTextChange(e.target.value) }
           style={{...defaultStyle,
             color: 'black',
             padding: '10px',
             fontSize: '20px'}}
        />
      </div>
    )
  }
}

class Playlist extends Component{
  render(){
    let playlist = this.props.playlist
    return(
      <div style={{display: 'inline-flex',
       'justify-content': 'space-between',
        border: '2px solid red',
        'overflow': 'auto'
      }}>
        <div style={{...defaultStyle,
          height: '175px',
          width: '175px',
          padding: '10px',
          backgroundColor: isEven(this.props.index) ?
           '#b6c6a0' : '#d5bdeb'
        }}>
          <h2 style={{marginBottom: '7px', fontWeight: 'bold'}}>{playlist.name}</h2>
          <img src={playlist.imageUrl} style={{width: '70px'}} />
          <ul style={{marginTop: '10px'}}>
            {playlist.songs.map(song =>
              <li style={{paddingTop: '2px'}}>{song.name}</li>
            )}
          </ul>
        </div>
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
      return playlistsPromise
    })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        return {
          name: item.name,
          imageUrl: item.images[0].url,
          songs: item.trackDatas.slice(0,3)
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
          let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
            .includes(this.state.filterString.toLowerCase()))
            return matchesPlaylist || matchesSong
      }) : []

      let reduceOptions =
        () => this.state.options.filter(o => o !== this.state.selected.label)

    return (
      <div className="App">
        {this.state.user ?
          <div>
            <h1 style={{...defaultStyle,
             fontSize: '54px',
             marginTop: '5px',
            }}>
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
              <Filter
                onTextChange={text => {
                  this.setState({filterString: text})
              }}/>
              {playlistToRender.map((playlist, i) =>
                <Playlist playlist={playlist} index={i} />
              )}
          </div>
        : <button onClick={() => {
            window.location = window.location.href.includes('localhost')
              ? 'http://localhost:8888/login'
              : 'https://better-playlists-backend-4-you.herokuapp.com/login' }
            }
            style={{padding: '20px', 'fontSize': '50px', 'marginTop': '20px'}}>
              Sign in to Spotify
          </button>
        }
      </div>
    );
  }
}

export default App;
