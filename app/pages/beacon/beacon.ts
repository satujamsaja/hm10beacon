import { Component, NgZone } from '@angular/core';
import { IBeacon, Toast, LocalNotifications } from 'ionic-native';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'build/pages/beacon/beacon.html',
})

export class BeaconPage {
  beacon;
  beaconRegion;
  regionState = '';
  region = '';
  regionArea = '';
  btnState = '';
  rangeState = '';


  constructor(private params: NavParams, private nav: NavController, private zone: NgZone) {
    this.beacon = params.data.beacon;
  }

  // start monitor
  monitor() {

    let delegate = IBeacon.Delegate();

    delegate.didRangeBeaconsInRegion().subscribe(data => {
      for (let beaconDevice of data.beacons) {
        if(beaconDevice.uuid == this.beacon.uuid) {
          this.zone.run(() => {
            this.beacon = beaconDevice;
            this.rangingCallback(beaconDevice);
          });
        }
      }
    }, error => { alert(error); });


    delegate.didDetermineStateForRegion().subscribe(data => {
      this.zone.run(() => {
        this.regionState = data.state;
        this.regionStateNotification(data.state);
      });
    }, error => { alert(error); });

    delegate.didStartMonitoringForRegion().subscribe(data => {
      this.zone.run(() => {
        this.region = data.region.identifier;
      });
    }, error => { alert(error); });

    this.beaconRegion = IBeacon.BeaconRegion('SMBEACON',this.beacon.uuid);

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


  // start monitor on page enter
  ionViewWillEnter() {
    this.monitor();
  }


  // on page leave stop any ranging and monitoring and start scan
  ionViewWillLeave() {
    this.stop();
  }

  // calculate ranging
  rangingCallback(beaconDevice) {
    let proximity: string = beaconDevice.proximity;

    switch(proximity) {
      case 'ProximityImmediate':
        this.zone.run(() => {
          Toast.show("Immediate", 'short', 'center').subscribe( toast => {});
          this.btnState = 'secondary';
          this.rangeState = 'Immediate';
        });
        break;

      case 'ProximityNear':
        this.zone.run(() => {
          Toast.show("Near", 'short', 'center').subscribe( toast => {});
          this.btnState = 'default';
          this.rangeState = 'Near';
        });
        break;

      case 'ProximityFar':
        this.zone.run(() => {
          Toast.show("Far", 'short', 'center').subscribe( toast => {});
          this.btnState = 'danger';
          this.rangeState = 'Far';
        });
        break;
    }
  }

  // show notification on entering region
  regionStateNotification(state) {
    let stateData: string = state;
    let message: string = '';
    let id: number;

    switch(stateData) {
      case 'CLRegionStateInside':
        id = 1;
        message = 'Inside region ' + this.region;
      break;
      case 'CLRegionStateOutside':
        id = 2;
        message = 'Outside region ' + this.region;
      break;
    }

    LocalNotifications.schedule({
      id: id,
      text: message,
    });
  }
}
