import { Component, NgZone } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { BeaconPage } from '../beacon/beacon';
import { IBeacon, LocalNotifications } from 'ionic-native';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  beacons = [];
  beaconRegion;
  region;

  constructor(private nav: NavController, private loading: LoadingController, private zone: NgZone) {

  }

  // scan beacon in region
  scan() {
    this.displayLoading();
    IBeacon.requestAlwaysAuthorization();

    let delegate = IBeacon.Delegate();

    delegate.didRangeBeaconsInRegion().subscribe(data => {
      this.zone.run(() => {
        this.beacons = [];
        for (let beacon of data.beacons) {
          this.beacons.push(beacon);
        }
      });
    }, error => { alert(error); });

    delegate.didStartMonitoringForRegion().subscribe(data => {
      this.zone.run(() => {
        this.region = data.region.identifier;
      });
    }, error => { alert(error); });

    this.beaconRegion = IBeacon.BeaconRegion('SMBEACON','74278BDA-B644-4520-8F0C-720EAF059935');

    IBeacon.startRangingBeaconsInRegion(this.beaconRegion)
      .then(
        () => {},
        error => alert(error)
    );

    IBeacon.startMonitoringForRegion(this.beaconRegion)
      .then(
        () => {},
        error => alert(error)
    );
  }

  // start monitoring beacon
  monitor(beacon) {
    this.stop();
    this.nav.push(BeaconPage, { beacon : beacon });
  }


  // stop ranging beacon in region
  stop() {
    IBeacon.stopRangingBeaconsInRegion(this.beaconRegion)
      .then(
        () => {},
        error => alert(error)
    );

    IBeacon.stopMonitoringForRegion(this.beaconRegion)
      .then(
        () => {},
        error => alert(error)
    );
  }

  // display loading
  displayLoading() {
    let loader = this.loading.create({
      content: "Please wait...",
      duration: 3000,
      dismissOnPageChange: true
    });
    loader.present();
  }

  // on page enter
  ionViewWillEnter() {
    this.scan();
  }

}
