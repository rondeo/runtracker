import React, { Component, Fragment } from 'react';
import axios from 'axios';
import MapNav from '../nav_folder/map_nav';
import Stopwatch from './stopwatch';
import MyMapComponent from './map';
import apiKey from '../googlemap';
import Distance from './distance';
import { NavLink } from 'react-router-dom';
import WatchBtns from './button.js';
import './run_map.scss';
import '../total_stats/total_stats.scss';


class RunMap extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentLatLng: {
                lat: 33,
                lng: -117
            },
            startPos: null,
            watchId: null,
            map: null,
            prevCoords: null,
            status: 'stopped',
            start: null,
            elapsed: 0,
            distance: 9.9,
            mileCounter: 1,
            pace: 100,
            calories: 100,
            renderPage: 'map',
            mileState: [],
            previousTime: 0
        }

        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this)
        this.update = this.update.bind(this);
        this.reset = this.reset.bind(this);
        this.distanceIncrement = this.distanceIncrement.bind(this);
        this.distanceUpdate = this.distanceUpdate.bind(this);
        this.clickMiles = this.clickMiles.bind(this);
    }

    postlatestMile() {
        const { distance } = this.state;
        console.log(distance);
        if (distance && distance - Math.floor(distance) === 0) {
            let {previousTime, elapsed, mileCounter} = this.state;

        const data = {
            run_id: 1,
            time: elapsed - previousTime,
            mileage: mileCounter
        }
        console.log('time', elapsed, 'previousTime', previousTime, 'mileCounter', mileCounter)
            axios.post(`/api/addpermile.php`, data).then(() => {
                console.log('post', data);
                mileCounter = mileCounter + 1;
                this.setState({
                    mileCounter,
                    previousTime: elapsed
                })
            })
        }
    }

    componentDidMount() {
        this.getGeoLocation();
        this.getMileData();
    }

    getMileData() {
        axios.get('/api/getpermile.php').then(resp => {
          const { mileTime } = resp.data;
          const mileStats = mileTime.map(item => {
            return (
              <tr key={item.id}>
                <td>{item.mile}</td>
                <td>{item.time}</td>
              </tr>
            )
          })
          this.setState({
            mileStats: [...mileStats]
          })
        })
      }

    getGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    console.log('geolocation coords: ', position.coords);
                    this.setState(prevState => ({
                        currentLatLng: {
                            ...prevState.currentLatLng,
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }))
                }
            )
        } else {
            error => console.log(error)
        }
    }

    startWatch = () => {
        this.refs.child.start();
    }

    // monitorUserLocation() {
    //     navigator.geolocation.watchPosition(position => {
    //         console.log('latitude: ', position.coords.latitude);
    //         console.log('longitude: ', position.coords.longitude);
    //         const distanceTravled = this.calculateDistance(this.state.startPos.coords.latitude, this.state.startPos.coords.longitude,
    //             position.coords.latitude, position.coords.longitude);
    //         console.log('distance traveled: ', distanceTravled)
    //     })
    // }
    // monitorUserLocation = () => {
    //     navigator.geolocation.watchPosition(position => {
    //         console.log('latitude: ', position.coords.latitude);
    //         console.log('longitude: ', position.coords.longitude);
    //         const distanceTravled = this.calculateDistance(this.state.latitude, this.state.longitude,
    //             position.coords.latitude, position.coords.longitude);
    //         console.log('distance traveled: ', distanceTravled)
    //     })
    // }

    // calculateDistance(lat1, lon1, lat2, lon2) {
    //     const R = 6371; // km
    //     let dLat = (lat2 - lat1) * Math.PI / 180;
    //     let dLon = (lon2 - lon1) * Math.PI / 180;
    //     let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    //         Math.sin(dLon / 2) * Math.sin(dLon / 2);
    //     let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //     let d = R * c;
    //     return d;
    // }

    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                console.log(position)
            })
        } else {
            console.log('Location not found')
        }
    }
    start() {
        const { start, elapsed } = this.state;
        let newStart = new Date().getTime();
        if (start) {
            newStart -= elapsed;
        }
        this.setState({
            status: 'running',
            start: newStart
        });
        setTimeout(() => {
            this.update();
        }, 10);
        this.distanceIncrement();
    }
    pause() {
        this.setState({
            status: 'paused'
        })
    }
    reset() {
        const { elapsed } = this.state;
        if (this.state.status === 'paused') {
            this.postCurrentRun(elapsed);
            this.setState({
                status: 'stopped',
                start: null,
                elapsed: 0,
                distance: 0
            });
        }
    }

    clickMap=()=>{
        this.setState ({
            renderPage: 'map'
        })
    }

    clickMiles(){
        this.setState({
            renderPage: 'Miles'
        })
    }
    update() {
        const { status, start } = this.state;
        if (status === 'running') {
            this.setState({
                elapsed: new Date().getTime() - start
            })
            setTimeout(this.update, 10);
        }
    }
    distanceIncrement() {
        setTimeout(() => {
            this.distanceUpdate();
            
        }, 1000);
    }
    distanceUpdate() {
        // debugger;
        let {distance} = this.state;
        // distance = 
        this.setState({
            distance: (parseFloat(distance) + 0.01).toFixed(2) 
        })
        setTimeout(this.distanceUpdate, 1000);
        this.postlatestMile();
    }
    postCurrentRun = (elapsed) => {
        const { distance, pace, calories } = this.state;
        axios.get(`/api/addrun.php?distance=${distance}&time=${elapsed}&pace=${pace}&calories=${calories}`).then((resp) => {
            console.log('this is response:', resp);
        });
    }

    getMileData() {
        axios.get('/api/getpermile.php').then(resp => {
        //   console.log('this is the resp:', resp);
          const { mileTime } = resp.data;
          const mileStats = mileTime.map(item => {
            return (
              <tr key={item.id}>
                <td>{item.mile}</td>
                <td>{item.time}</td>
              </tr>
            )
          })
          this.setState({
            mileStats: [...mileStats]
          })
        })
      }
    
    renderPage=()=>{
        const { elapsed, distance, status, renderPage } = this.state;
        if(renderPage === 'map'){
            return(
                <Fragment>
                <div className="h-60 mapContainer">
                <div className="map">
                    <MyMapComponent
                        isMarkerShown
                        // googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDtWT-ZM2l21GJnuT7cjNZYmbQa0flwL6c&v=3.exp&libraries=geometry,drawing,places"
                        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.exp&libraries=geometry,drawing,places`}
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `100%` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                        currentLocation={this.state.currentLatLng}
                    />
                </div>
                <div className="buttonsContainer">
                    <WatchBtns status={status}
                        start={this.start}
                        pause={this.pause}
                        reset={this.reset} />
                </div>
            </div>
            <div className="mapStatsContainer">
                <div className="statContainer">
                    <div className="statTitle">Time</div>
                    <Stopwatch className="statResult" elapsed={elapsed} />
                </div>
                <div className="statContainer">
                    <div className="statTitle">Distance</div>
                    <Distance className="statResult" distance={distance} />
                    {/* <button onClick={this.distanceIncrement} className="btn btn-info btn-sm">Increment</button> */}
                </div>
                <div className="statContainer">
                    <div className="statTitle">Pace</div>
                    <div className="statResult">11:44</div>
                </div>
                <div className="statContainer">
                    <div className="statTitle">Calories Burned</div>
                    <div className="statResult">1,600 cal</div>
                </div>
            </div>
            </Fragment>
            )
        } else{
            return (
                <Fragment>
                    <div className="float-right text-primary pt-3 pb-3">Total | Month | Week </div>
                        <table className="table table-hover">
                            <thead>
                            <tr>
                                <th className="w-25">Mile</th>
                                <th className="w-25">Time</th>
                                {/* <th className="w-25">Heart Rate</th>
                                <th className="w-25">Calories Burned</th> */}
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.mileStats}
                            </tbody>    
                        </table>
                </Fragment>
            )

        }
    }

    render() {
        return (
            <div className="mapBody">
                <MapNav clickMap = {this.clickMap} clickMiles={this.clickMiles} />
                {this.renderPage()}
            </div>
        )
    }
}

export default RunMap;
